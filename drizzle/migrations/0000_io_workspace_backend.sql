CREATE TYPE public.app_role AS ENUM ('contributor','analyst','hr_reviewer','admin');
CREATE TABLE public.profiles(id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,full_name text NOT NULL DEFAULT '',created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.profiles TO authenticated; GRANT UPDATE(full_name) ON public.profiles TO authenticated; GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY signed_in_read ON public.profiles FOR SELECT TO authenticated USING(true);
CREATE POLICY own_profile_update ON public.profiles FOR UPDATE TO authenticated USING(id=auth.uid()) WITH CHECK(id=auth.uid());
CREATE TABLE public.user_roles(user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,role public.app_role NOT NULL,PRIMARY KEY(user_id,role));
GRANT SELECT,INSERT,DELETE ON public.user_roles TO authenticated; GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.has_role(user_id uuid,role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=$1 AND r.role=$2) $$;
REVOKE ALL ON FUNCTION public.has_role(uuid,public.app_role) FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.has_role(uuid,public.app_role) TO authenticated,service_role;
CREATE POLICY signed_in_read ON public.user_roles FOR SELECT TO authenticated USING(true);
CREATE POLICY admin_assign_role ON public.user_roles FOR INSERT TO authenticated WITH CHECK(public.has_role(auth.uid(),'admin'));
CREATE POLICY admin_remove_role ON public.user_roles FOR DELETE TO authenticated USING(public.has_role(auth.uid(),'admin'));
CREATE FUNCTION public.can_edit_workspace() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT public.has_role(auth.uid(),'analyst') OR public.has_role(auth.uid(),'admin') $$;
REVOKE ALL ON FUNCTION public.can_edit_workspace() FROM PUBLIC,anon; GRANT EXECUTE ON FUNCTION public.can_edit_workspace() TO authenticated,service_role;
CREATE FUNCTION public.create_user_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN INSERT INTO public.profiles(id,full_name) VALUES(NEW.id,coalesce(NEW.raw_user_meta_data->>'full_name','')); RETURN NEW; END $$;
REVOKE ALL ON FUNCTION public.create_user_profile() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER create_profile_on_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();
CREATE TABLE public.job_roles(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),title text NOT NULL,department text NOT NULL,status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','archived')),created_by uuid DEFAULT auth.uid(),created_at timestamptz NOT NULL DEFAULT now(),is_fictional boolean NOT NULL DEFAULT false);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.job_roles TO authenticated; GRANT ALL ON public.job_roles TO service_role;
ALTER TABLE public.job_roles ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.evidence_items(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),job_role_id uuid NOT NULL REFERENCES public.job_roles(id),code text NOT NULL,title text NOT NULL,source_type text NOT NULL CHECK(source_type IN ('sop','job_description','sme_interview','observation','survey','other')),excerpt text NOT NULL,source_reference text,added_by uuid DEFAULT auth.uid(),created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(job_role_id,code));
GRANT SELECT,INSERT,UPDATE,DELETE ON public.evidence_items TO authenticated; GRANT ALL ON public.evidence_items TO service_role;
ALTER TABLE public.evidence_items ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.contributions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),job_role_id uuid NOT NULL REFERENCES public.job_roles(id),contributor_id uuid NOT NULL DEFAULT auth.uid(),contributor_type text NOT NULL CHECK(contributor_type IN ('incumbent','supervisor','hr','other')),content text NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT ON public.contributions TO authenticated; GRANT ALL ON public.contributions TO service_role;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY contributor_insert ON public.contributions FOR INSERT TO authenticated WITH CHECK(contributor_id=auth.uid() AND public.has_role(auth.uid(),'contributor'));
CREATE TABLE public.role_analysis_versions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),job_role_id uuid NOT NULL REFERENCES public.job_roles(id),version_number integer NOT NULL CHECK(version_number>0),status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','in_review','approved','rejected')),summary text NOT NULL DEFAULT '',created_by uuid DEFAULT auth.uid(),created_at timestamptz NOT NULL DEFAULT now(),approved_by uuid,approved_at timestamptz,UNIQUE(job_role_id,version_number));
GRANT SELECT,INSERT,UPDATE,DELETE ON public.role_analysis_versions TO authenticated; GRANT ALL ON public.role_analysis_versions TO service_role;
ALTER TABLE public.role_analysis_versions ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.competencies(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),analysis_version_id uuid NOT NULL REFERENCES public.role_analysis_versions(id),name text NOT NULL,definition text NOT NULL,importance integer NOT NULL CHECK(importance BETWEEN 1 AND 5),required_at_entry boolean NOT NULL DEFAULT false,created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT,UPDATE,DELETE ON public.competencies TO authenticated; GRANT ALL ON public.competencies TO service_role;
ALTER TABLE public.competencies ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.competency_evidence(competency_id uuid NOT NULL REFERENCES public.competencies(id),evidence_id uuid NOT NULL REFERENCES public.evidence_items(id),PRIMARY KEY(competency_id,evidence_id));
GRANT SELECT,INSERT,UPDATE,DELETE ON public.competency_evidence TO authenticated; GRANT ALL ON public.competency_evidence TO service_role;
ALTER TABLE public.competency_evidence ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.evidence_conflicts(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),job_role_id uuid NOT NULL REFERENCES public.job_roles(id),topic text NOT NULL,description text NOT NULL,status text NOT NULL DEFAULT 'open' CHECK(status IN ('open','resolved')),resolution_note text,resolved_by uuid,resolved_at timestamptz);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.evidence_conflicts TO authenticated; GRANT ALL ON public.evidence_conflicts TO service_role;
ALTER TABLE public.evidence_conflicts ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.conflict_evidence(conflict_id uuid NOT NULL REFERENCES public.evidence_conflicts(id),evidence_id uuid NOT NULL REFERENCES public.evidence_items(id),PRIMARY KEY(conflict_id,evidence_id));
GRANT SELECT,INSERT,UPDATE,DELETE ON public.conflict_evidence TO authenticated; GRANT ALL ON public.conflict_evidence TO service_role;
ALTER TABLE public.conflict_evidence ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.hiring_packages(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),job_role_id uuid NOT NULL REFERENCES public.job_roles(id),analysis_version_id uuid NOT NULL REFERENCES public.role_analysis_versions(id),status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','needs_review','submitted','approved','rejected')),created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT,UPDATE,DELETE ON public.hiring_packages TO authenticated; GRANT ALL ON public.hiring_packages TO service_role;
ALTER TABLE public.hiring_packages ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.package_materials(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),package_id uuid NOT NULL REFERENCES public.hiring_packages(id),material_type text NOT NULL CHECK(material_type IN ('job_posting','work_sample','interview_guide')),version_label text NOT NULL DEFAULT 'v0.1',content text NOT NULL DEFAULT '',status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','needs_review','approved')),blocked_by_conflict_id uuid REFERENCES public.evidence_conflicts(id),created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),UNIQUE(package_id,material_type,version_label));
GRANT SELECT,INSERT,UPDATE,DELETE ON public.package_materials TO authenticated; GRANT ALL ON public.package_materials TO service_role;
ALTER TABLE public.package_materials ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.material_citations(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),material_id uuid NOT NULL REFERENCES public.package_materials(id),statement text NOT NULL CHECK(length(btrim(statement))>0),evidence_id uuid NOT NULL REFERENCES public.evidence_items(id));
GRANT SELECT,INSERT,UPDATE,DELETE ON public.material_citations TO authenticated; GRANT ALL ON public.material_citations TO service_role;
ALTER TABLE public.material_citations ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.approvals(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),entity_type text NOT NULL CHECK(entity_type IN ('role_analysis_version','hiring_package')),entity_id uuid NOT NULL,requested_by uuid DEFAULT auth.uid(),requested_at timestamptz NOT NULL DEFAULT now(),reviewer_id uuid,decision text NOT NULL DEFAULT 'pending' CHECK(decision IN ('pending','approved','rejected')),comment text,decided_at timestamptz);
GRANT SELECT,INSERT,UPDATE ON public.approvals TO authenticated; GRANT ALL ON public.approvals TO service_role;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY editors_request ON public.approvals FOR INSERT TO authenticated WITH CHECK(public.can_edit_workspace() AND requested_by=auth.uid() AND decision='pending');
CREATE POLICY reviewer_decision ON public.approvals FOR UPDATE TO authenticated USING(public.has_role(auth.uid(),'hr_reviewer')) WITH CHECK(public.has_role(auth.uid(),'hr_reviewer'));
CREATE TABLE public.activity_log(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid,action text NOT NULL,entity_type text NOT NULL,entity_id uuid,details jsonb NOT NULL DEFAULT '{}'::jsonb,created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.activity_log TO authenticated; GRANT ALL ON public.activity_log TO service_role;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
DO $$ DECLARE t text; BEGIN
FOREACH t IN ARRAY ARRAY['job_roles','evidence_items','contributions','role_analysis_versions','competencies','competency_evidence','evidence_conflicts','conflict_evidence','hiring_packages','package_materials','material_citations','approvals','activity_log'] LOOP
EXECUTE format('CREATE POLICY signed_in_read ON public.%I FOR SELECT TO authenticated USING(true)',t);
IF t NOT IN ('contributions','approvals','activity_log') THEN
EXECUTE format('CREATE POLICY editors_insert ON public.%I FOR INSERT TO authenticated WITH CHECK(public.can_edit_workspace())',t);
EXECUTE format('CREATE POLICY editors_update ON public.%I FOR UPDATE TO authenticated USING(public.can_edit_workspace()) WITH CHECK(public.can_edit_workspace())',t);
EXECUTE format('CREATE POLICY editors_delete ON public.%I FOR DELETE TO authenticated USING(public.can_edit_workspace())',t);
END IF;
IF t IN ('role_analysis_versions','hiring_packages','package_materials') THEN EXECUTE format('CREATE POLICY reviewer_update ON public.%I FOR UPDATE TO authenticated USING(public.has_role(auth.uid(),''hr_reviewer'')) WITH CHECK(public.has_role(auth.uid(),''hr_reviewer''))',t); END IF;
END LOOP; END $$;
CREATE INDEX ON public.evidence_items(job_role_id); CREATE INDEX ON public.contributions(job_role_id); CREATE INDEX ON public.contributions(contributor_id); CREATE INDEX ON public.competencies(analysis_version_id); CREATE INDEX ON public.competency_evidence(evidence_id); CREATE INDEX ON public.evidence_conflicts(job_role_id); CREATE INDEX ON public.conflict_evidence(evidence_id); CREATE INDEX ON public.hiring_packages(analysis_version_id); CREATE INDEX ON public.hiring_packages(job_role_id); CREATE INDEX ON public.package_materials(blocked_by_conflict_id); CREATE INDEX ON public.material_citations(material_id); CREATE INDEX ON public.material_citations(evidence_id); CREATE INDEX ON public.approvals(entity_id); CREATE INDEX ON public.activity_log(entity_id);
CREATE FUNCTION public.guard_workspace_row() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o jsonb; n jsonb; rid uuid; parent_id uuid; st text; role_id uuid; eid uuid; privileged boolean; reviewer boolean; editor boolean;
BEGIN
IF TG_OP<>'INSERT' THEN o:=to_jsonb(OLD); END IF; IF TG_OP<>'DELETE' THEN n:=to_jsonb(NEW); END IF;
PERFORM pg_advisory_xact_lock(710112026);
privileged:=coalesce(auth.role(),'')='service_role' OR (auth.uid() IS NULL AND coalesce(current_setting('role',true),'none') NOT IN ('authenticated','anon'));
reviewer:=privileged OR public.has_role(auth.uid(),'hr_reviewer'); editor:=privileged OR public.can_edit_workspace();
IF TG_TABLE_NAME IN ('role_analysis_versions','hiring_packages','package_materials') THEN
IF o->>'status'='approved' THEN RAISE EXCEPTION 'Approved records are read-only; create a new version' USING ERRCODE='23514'; END IF;
IF n->>'status'='approved' AND (TG_OP='INSERT' OR o->>'status' IS DISTINCT FROM 'approved') AND NOT reviewer THEN RAISE EXCEPTION 'Only hr_reviewer can approve' USING ERRCODE='42501'; END IF;
IF TG_OP='INSERT' AND NOT editor THEN RAISE EXCEPTION 'Only analysts and admins create records' USING ERRCODE='42501'; END IF;
IF TG_OP='UPDATE' AND NOT editor THEN
IF NOT reviewer OR (n - ARRAY['status','approved_by','approved_at','updated_at']) IS DISTINCT FROM (o - ARRAY['status','approved_by','approved_at','updated_at']) OR n->>'status' NOT IN ('approved','rejected') THEN RAISE EXCEPTION 'Reviewer may change only the approval decision' USING ERRCODE='42501'; END IF;
END IF;
END IF;
IF TG_TABLE_NAME='role_analysis_versions' AND TG_OP<>'DELETE' THEN
IF n->>'status'='approved' THEN
IF NOT privileged AND (NOT EXISTS(SELECT 1 FROM competencies c WHERE c.analysis_version_id=NEW.id) OR EXISTS(SELECT 1 FROM competencies c WHERE c.analysis_version_id=NEW.id AND NOT EXISTS(SELECT 1 FROM competency_evidence ce WHERE ce.competency_id=c.id))) THEN RAISE EXCEPTION 'Approval requires evidence for every competency' USING ERRCODE='23514'; END IF;
NEW.approved_by:=auth.uid(); NEW.approved_at:=now();
ELSE NEW.approved_by:=NULL; NEW.approved_at:=NULL; END IF;
END IF;
IF TG_TABLE_NAME='hiring_packages' AND TG_OP<>'DELETE' THEN
SELECT status,job_role_id INTO st,role_id FROM role_analysis_versions WHERE id=NEW.analysis_version_id FOR UPDATE;
IF st IS DISTINCT FROM 'approved' OR role_id IS DISTINCT FROM NEW.job_role_id THEN RAISE EXCEPTION 'Hiring package requires an approved analysis of the same job role' USING ERRCODE='23514'; END IF;
IF TG_OP='UPDATE' AND (NEW.analysis_version_id<>OLD.analysis_version_id OR NEW.job_role_id<>OLD.job_role_id) AND EXISTS(SELECT 1 FROM package_materials WHERE package_id=NEW.id) THEN RAISE EXCEPTION 'A package with materials cannot change its analysis or job role' USING ERRCODE='23514'; END IF;
IF NEW.status IN ('submitted','approved') THEN
IF EXISTS(SELECT 1 FROM package_materials m JOIN evidence_conflicts c ON c.id=m.blocked_by_conflict_id WHERE m.package_id=NEW.id AND c.status='open') THEN RAISE EXCEPTION 'Submission blocked by an open evidence conflict' USING ERRCODE='23514'; END IF;
IF EXISTS(SELECT 1 FROM package_materials m WHERE m.package_id=NEW.id AND btrim(m.content)<>'' AND NOT EXISTS(SELECT 1 FROM material_citations mc WHERE mc.material_id=m.id)) THEN RAISE EXCEPTION 'Materials require evidence citations before submission' USING ERRCODE='23514'; END IF;
IF NOT EXISTS(SELECT 1 FROM package_materials m WHERE m.package_id=NEW.id AND btrim(m.content)<>'') THEN RAISE EXCEPTION 'Cannot submit an empty package' USING ERRCODE='23514'; END IF;
END IF;
END IF;
IF TG_TABLE_NAME IN ('competencies','competency_evidence') THEN
FOR parent_id IN SELECT DISTINCT v FROM unnest(ARRAY[(CASE WHEN TG_TABLE_NAME='competencies' THEN o->>'analysis_version_id' ELSE (SELECT analysis_version_id::text FROM competencies WHERE id=(o->>'competency_id')::uuid) END)::uuid,(CASE WHEN TG_TABLE_NAME='competencies' THEN n->>'analysis_version_id' ELSE (SELECT analysis_version_id::text FROM competencies WHERE id=(n->>'competency_id')::uuid) END)::uuid]) v WHERE v IS NOT NULL LOOP
SELECT status INTO st FROM role_analysis_versions WHERE id=parent_id FOR UPDATE;
IF st='approved' THEN RAISE EXCEPTION 'Approved analysis competencies and citations are read-only' USING ERRCODE='23514'; END IF;
END LOOP;
IF TG_TABLE_NAME='competency_evidence' AND TG_OP<>'DELETE' THEN
SELECT v.job_role_id INTO role_id FROM competencies c JOIN role_analysis_versions v ON v.id=c.analysis_version_id WHERE c.id=NEW.competency_id;
IF role_id IS DISTINCT FROM (SELECT job_role_id FROM evidence_items WHERE id=NEW.evidence_id) THEN RAISE EXCEPTION 'Competency evidence must belong to the same job role' USING ERRCODE='23514'; END IF;
END IF;
END IF;
IF TG_TABLE_NAME IN ('package_materials','material_citations') THEN
FOR parent_id IN SELECT DISTINCT v FROM unnest(ARRAY[(CASE WHEN TG_TABLE_NAME='package_materials' THEN o->>'package_id' ELSE (SELECT package_id::text FROM package_materials WHERE id=(o->>'material_id')::uuid) END)::uuid,(CASE WHEN TG_TABLE_NAME='package_materials' THEN n->>'package_id' ELSE (SELECT package_id::text FROM package_materials WHERE id=(n->>'material_id')::uuid) END)::uuid]) v WHERE v IS NOT NULL LOOP
SELECT status INTO st FROM hiring_packages WHERE id=parent_id FOR UPDATE;
IF st IN ('submitted','approved') THEN RAISE EXCEPTION 'Submitted or approved package contents are read-only' USING ERRCODE='23514'; END IF;
END LOOP;
IF TG_TABLE_NAME='material_citations' THEN
IF EXISTS(SELECT 1 FROM package_materials WHERE id IN ((o->>'material_id')::uuid,(n->>'material_id')::uuid) AND status='approved') THEN RAISE EXCEPTION 'Approved material citations are read-only' USING ERRCODE='23514'; END IF;
IF TG_OP<>'DELETE' THEN
SELECT p.job_role_id INTO role_id FROM package_materials m JOIN hiring_packages p ON p.id=m.package_id WHERE m.id=NEW.material_id;
IF role_id IS DISTINCT FROM (SELECT job_role_id FROM evidence_items WHERE id=NEW.evidence_id) THEN RAISE EXCEPTION 'Material evidence must belong to the same job role' USING ERRCODE='23514'; END IF;
IF NOT EXISTS(SELECT 1 FROM package_materials WHERE id=NEW.material_id AND strpos(content,NEW.statement)>0) THEN RAISE EXCEPTION 'Cited statement must occur in material content' USING ERRCODE='23514'; END IF;
END IF;
ELSE
NEW.updated_at:=now();
IF TG_OP<>'DELETE' AND NEW.blocked_by_conflict_id IS NOT NULL THEN
SELECT job_role_id,status INTO role_id,st FROM evidence_conflicts WHERE id=NEW.blocked_by_conflict_id FOR UPDATE;
IF role_id IS DISTINCT FROM (SELECT job_role_id FROM hiring_packages WHERE id=NEW.package_id) THEN RAISE EXCEPTION 'Blocking conflict must belong to the same job role' USING ERRCODE='23514'; END IF;
IF NEW.status='approved' AND st='open' THEN RAISE EXCEPTION 'Cannot approve a material blocked by an open conflict' USING ERRCODE='23514'; END IF;
END IF;
IF TG_OP='UPDATE' AND EXISTS(SELECT 1 FROM material_citations WHERE material_id=NEW.id AND strpos(NEW.content,statement)=0) THEN RAISE EXCEPTION 'Remove obsolete citations before changing cited text' USING ERRCODE='23514'; END IF;
IF TG_OP<>'DELETE' AND NEW.status='approved' AND NOT EXISTS(SELECT 1 FROM material_citations WHERE material_id=NEW.id) THEN RAISE EXCEPTION 'Material approval requires evidence citations' USING ERRCODE='23514'; END IF;
END IF;
END IF;
IF TG_TABLE_NAME='conflict_evidence' AND TG_OP<>'DELETE' THEN
IF (SELECT job_role_id FROM evidence_conflicts WHERE id=NEW.conflict_id) IS DISTINCT FROM (SELECT job_role_id FROM evidence_items WHERE id=NEW.evidence_id) THEN RAISE EXCEPTION 'Conflict evidence must belong to the same job role' USING ERRCODE='23514'; END IF;
END IF;
IF TG_TABLE_NAME='evidence_conflicts' AND TG_OP<>'DELETE' THEN
IF NEW.status='resolved' THEN
IF btrim(coalesce(NEW.resolution_note,''))='' THEN RAISE EXCEPTION 'Resolving a conflict requires a resolution note' USING ERRCODE='23514'; END IF;
NEW.resolved_by:=auth.uid(); NEW.resolved_at:=now();
ELSE
IF EXISTS(SELECT 1 FROM package_materials m JOIN hiring_packages p ON p.id=m.package_id WHERE m.blocked_by_conflict_id=NEW.id AND (m.status='approved' OR p.status IN ('submitted','approved'))) THEN RAISE EXCEPTION 'Cannot reopen a conflict referenced by submitted or approved materials' USING ERRCODE='23514'; END IF;
NEW.resolved_by:=NULL; NEW.resolved_at:=NULL;
END IF;
IF TG_OP='UPDATE' AND NEW.job_role_id<>OLD.job_role_id AND (EXISTS(SELECT 1 FROM conflict_evidence WHERE conflict_id=NEW.id) OR EXISTS(SELECT 1 FROM package_materials WHERE blocked_by_conflict_id=NEW.id)) THEN RAISE EXCEPTION 'Linked conflict cannot change job role' USING ERRCODE='23514'; END IF;
END IF;
IF TG_TABLE_NAME='evidence_items' AND TG_OP<>'INSERT' THEN
IF EXISTS(SELECT 1 FROM competency_evidence ce JOIN competencies c ON c.id=ce.competency_id JOIN role_analysis_versions v ON v.id=c.analysis_version_id WHERE ce.evidence_id=OLD.id AND v.status='approved') OR EXISTS(SELECT 1 FROM material_citations mc JOIN package_materials m ON m.id=mc.material_id JOIN hiring_packages p ON p.id=m.package_id WHERE mc.evidence_id=OLD.id AND (m.status='approved' OR p.status IN ('submitted','approved'))) THEN RAISE EXCEPTION 'Evidence cited by approved records is read-only' USING ERRCODE='23514'; END IF;
IF TG_OP='UPDATE' AND NEW.job_role_id<>OLD.job_role_id AND (EXISTS(SELECT 1 FROM competency_evidence WHERE evidence_id=OLD.id) OR EXISTS(SELECT 1 FROM material_citations WHERE evidence_id=OLD.id) OR EXISTS(SELECT 1 FROM conflict_evidence WHERE evidence_id=OLD.id)) THEN RAISE EXCEPTION 'Linked evidence cannot change job role' USING ERRCODE='23514'; END IF;
END IF;
IF TG_TABLE_NAME='approvals' THEN
IF TG_OP='UPDATE' AND (OLD.decision<>'pending' OR (n-ARRAY['reviewer_id','decision','comment','decided_at']) IS DISTINCT FROM (o-ARRAY['reviewer_id','decision','comment','decided_at'])) THEN RAISE EXCEPTION 'Approval requests and final decisions are immutable' USING ERRCODE='23514'; END IF;
IF NEW.entity_type='role_analysis_version' THEN SELECT status INTO st FROM role_analysis_versions WHERE id=NEW.entity_id FOR UPDATE; ELSE SELECT status INTO st FROM hiring_packages WHERE id=NEW.entity_id FOR UPDATE; END IF;
IF st IS NULL THEN RAISE EXCEPTION 'Approval target does not exist' USING ERRCODE='23514'; END IF;
IF NEW.decision<>'pending' THEN
IF NOT reviewer THEN RAISE EXCEPTION 'Only hr_reviewer can decide approvals' USING ERRCODE='42501'; END IF;
IF (NEW.entity_type='role_analysis_version' AND st<>'in_review') OR (NEW.entity_type='hiring_package' AND st<>'submitted') THEN RAISE EXCEPTION 'Approval target must be awaiting review' USING ERRCODE='23514'; END IF;
NEW.reviewer_id:=auth.uid(); NEW.decided_at:=now();
IF NEW.entity_type='role_analysis_version' THEN UPDATE role_analysis_versions SET status=NEW.decision WHERE id=NEW.entity_id; ELSE UPDATE hiring_packages SET status=NEW.decision WHERE id=NEW.entity_id; END IF;
ELSE NEW.reviewer_id:=NULL; NEW.decided_at:=NULL; END IF;
END IF;
IF TG_OP='DELETE' THEN RETURN OLD; END IF; RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.guard_workspace_row() FROM PUBLIC,anon,authenticated;
CREATE FUNCTION public.log_workspace_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE o jsonb; n jsonb; BEGIN
IF TG_OP<>'INSERT' THEN o:=to_jsonb(OLD); END IF; IF TG_OP<>'DELETE' THEN n:=to_jsonb(NEW); END IF;
INSERT INTO activity_log(user_id,action,entity_type,entity_id,details) VALUES(auth.uid(),lower(TG_OP),TG_TABLE_NAME,coalesce((n->>'id')::uuid,(o->>'id')::uuid,(n->>'competency_id')::uuid,(o->>'competency_id')::uuid,(n->>'conflict_id')::uuid,(o->>'conflict_id')::uuid,(n->>'user_id')::uuid,(o->>'user_id')::uuid),jsonb_build_object('before',o,'after',n));
IF TG_OP='DELETE' THEN RETURN OLD; END IF; RETURN NEW; END $$;
REVOKE ALL ON FUNCTION public.log_workspace_change() FROM PUBLIC,anon,authenticated;
DO $$ DECLARE t text; BEGIN
FOREACH t IN ARRAY ARRAY['evidence_items','role_analysis_versions','competencies','competency_evidence','evidence_conflicts','conflict_evidence','hiring_packages','package_materials','material_citations','approvals'] LOOP EXECUTE format('CREATE TRIGGER workspace_guard BEFORE INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.guard_workspace_row()',t); END LOOP;
FOREACH t IN ARRAY ARRAY['profiles','user_roles','job_roles','evidence_items','contributions','role_analysis_versions','competencies','competency_evidence','evidence_conflicts','conflict_evidence','hiring_packages','package_materials','material_citations','approvals'] LOOP EXECUTE format('CREATE TRIGGER workspace_audit AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.log_workspace_change()',t); END LOOP;
END $$;
COMMENT ON TABLE public.activity_log IS 'Append-only audit history; clients cannot forge or modify entries.';
COMMENT ON TABLE public.job_roles IS 'is_fictional flags demonstration records. Actor UUIDs may be null for system-created demo records.';