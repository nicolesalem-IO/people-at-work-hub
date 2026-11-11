CREATE FUNCTION public.guard_assessment_battery() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE priv boolean;r jsonb;i jsonb;BEGIN PERFORM pg_advisory_xact_lock(811112026);priv:=coalesce(auth.role(),'')='service_role' OR (auth.uid() IS NULL AND coalesce(current_setting('role',true),'none') NOT IN ('anon','authenticated'));
IF TG_OP='UPDATE' AND OLD.status='approved' THEN RAISE EXCEPTION 'Approved battery immutable; create new version'; END IF;
IF NEW.payload->>'id' IS DISTINCT FROM NEW.id::text OR NEW.payload->>'status' IS DISTINCT FROM NEW.status OR NEW.payload->>'analysis_status' IS DISTINCT FROM NEW.analysis_status THEN RAISE EXCEPTION 'Battery identity/status mismatch';END IF;
IF NOT priv THEN
IF TG_OP='INSERT' AND (NEW.status<>'draft' OR NEW.analysis_status<>'draft') THEN RAISE EXCEPTION 'New battery must be draft';END IF;
IF TG_OP='UPDATE' THEN
IF NEW.created_by IS DISTINCT FROM OLD.created_by THEN RAISE EXCEPTION 'Owner immutable';END IF;
IF ((NEW.status='approved' AND OLD.status<>'approved') OR (NEW.analysis_status='approved' AND OLD.analysis_status<>'approved')) AND NOT public.has_role(auth.uid(),'hr_reviewer') THEN RAISE EXCEPTION 'Only HR can approve';END IF;
IF NOT public.can_edit_workspace() THEN
IF public.has_role(auth.uid(),'hr_reviewer') THEN
IF (NEW.payload-ARRAY['status','analysis_status','history']) IS DISTINCT FROM (OLD.payload-ARRAY['status','analysis_status','history']) THEN RAISE EXCEPTION 'HR may change review decision only';END IF;
ELSIF public.assessment_permission(NEW.id,'sme') THEN
IF (NEW.payload-ARRAY['ratings','incidents','items','angoff','history']) IS DISTINCT FROM (OLD.payload-ARRAY['ratings','incidents','items','angoff','history']) THEN RAISE EXCEPTION 'SME may change judgments only';END IF;
FOR r IN SELECT value FROM jsonb_array_elements(NEW.payload->'ratings') UNION ALL SELECT value FROM jsonb_array_elements(NEW.payload->'incidents') UNION ALL SELECT value FROM jsonb_array_elements(NEW.payload->'angoff') LOOP
IF NOT ((OLD.payload->'ratings') @> jsonb_build_array(r) OR (OLD.payload->'incidents') @> jsonb_build_array(r) OR (OLD.payload->'angoff') @> jsonb_build_array(r)) AND NOT EXISTS(SELECT 1 FROM assessment_access WHERE battery_id=NEW.id AND user_id=auth.uid() AND permission='sme' AND source_id=r->>'source_id') THEN RAISE EXCEPTION 'Source must match assigned SME';END IF;
END LOOP;
ELSE RAISE EXCEPTION 'Insufficient role';END IF;END IF;
IF OLD.analysis_status='approved' AND (NEW.payload-ARRAY['items','mappings','angoff','cut_score','work_cut','weight_overrides','weight_rationale','status','history']) IS DISTINCT FROM (OLD.payload-ARRAY['items','mappings','angoff','cut_score','work_cut','weight_overrides','weight_rationale','status','history']) THEN RAISE EXCEPTION 'Approved analysis immutable';END IF;
IF OLD.status='in_review' AND (NEW.payload-ARRAY['status','history']) IS DISTINCT FROM (OLD.payload-ARRAY['status','history']) THEN RAISE EXCEPTION 'Submitted battery frozen';END IF;
END IF;
IF NEW.analysis_status IN ('in_review','approved') AND NOT public.assessment_analysis_ready(NEW.payload) THEN RAISE EXCEPTION 'Analysis coverage incomplete';END IF;
IF NEW.status IN ('in_review','approved') AND NOT public.assessment_ready(NEW.payload) THEN RAISE EXCEPTION 'Battery requires coverage, SME items, Angoff and HR analysis approval';END IF;
FOR i IN SELECT value FROM jsonb_array_elements(NEW.payload->'items') LOOP
IF i->>'method'='sjt' AND (jsonb_array_length(i->'options')<>4 OR (i->>'status'='approved' AND jsonb_array_length(i->'key')<>4)) THEN RAISE EXCEPTION 'SJT requires four options and key';END IF;
IF TG_OP='UPDATE' THEN
SELECT value INTO r FROM jsonb_array_elements(OLD.payload->'items') WHERE value->>'id'=i->>'id';
IF r IS NOT NULL AND (r-ARRAY['status','approvals']) IS DISTINCT FROM (i-ARRAY['status','approvals']) AND i->>'status'='approved' THEN RAISE EXCEPTION 'Edited item must return to draft';END IF;
IF i->>'status'='approved' AND (r IS NULL OR r->>'status'<>'approved') AND NOT public.assessment_permission(NEW.id,'sme') THEN RAISE EXCEPTION 'Assigned SME must approve';END IF;
END IF;END LOOP;END IF;
IF NEW.status='approved' THEN NEW.approved_by:=auth.uid();NEW.approved_at:=now();END IF;RETURN NEW;END $$;
CREATE TRIGGER guard_assessment BEFORE INSERT OR UPDATE ON public.assessment_batteries FOR EACH ROW EXECUTE FUNCTION public.guard_assessment_battery();CREATE TRIGGER audit_assessment AFTER INSERT OR UPDATE ON public.assessment_batteries FOR EACH ROW EXECUTE FUNCTION public.log_workspace_change();
CREATE FUNCTION public.guard_assessment_attempt() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE priv boolean;BEGIN PERFORM pg_advisory_xact_lock(811112026);priv:=coalesce(auth.role(),'')='service_role' OR (auth.uid() IS NULL AND coalesce(current_setting('role',true),'none') NOT IN ('anon','authenticated'));IF (SELECT status FROM assessment_batteries WHERE id=NEW.battery_id)<>'approved' THEN RAISE EXCEPTION 'Candidate release requires HR approval';END IF;
IF TG_OP='UPDATE' THEN
IF NEW.id<>OLD.id OR NEW.battery_id<>OLD.battery_id THEN RAISE EXCEPTION 'Attempt version immutable';END IF;
IF OLD.status IN ('submitted','scored') AND NEW.answers<>OLD.answers THEN RAISE EXCEPTION 'Submitted answers immutable';END IF;
IF NOT priv THEN
IF (to_jsonb(NEW)-ARRAY['raters','reconciliations']) IS DISTINCT FROM (to_jsonb(OLD)-ARRAY['raters','reconciliations']) THEN RAISE EXCEPTION 'Candidate administration and scoring use protected actions';END IF;
END IF;
ELSIF NOT priv AND (NEW.token_hash IS NOT NULL OR NEW.status<>'invited') THEN RAISE EXCEPTION 'Invitation generation server controlled';END IF;RETURN NEW;END $$;
CREATE TRIGGER guard_attempt BEFORE INSERT OR UPDATE ON public.assessment_attempts FOR EACH ROW EXECUTE FUNCTION public.guard_assessment_attempt();CREATE TRIGGER audit_attempt AFTER INSERT OR UPDATE ON public.assessment_attempts FOR EACH ROW EXECUTE FUNCTION public.log_workspace_change();REVOKE ALL ON FUNCTION public.guard_assessment_battery(),public.guard_assessment_attempt() FROM PUBLIC,anon,authenticated;