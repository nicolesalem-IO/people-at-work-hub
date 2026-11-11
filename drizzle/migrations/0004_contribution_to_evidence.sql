CREATE FUNCTION public.convert_contribution_to_evidence(contribution_id uuid,evidence_code text,evidence_title text) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$ DECLARE c public.contributions; eid uuid; BEGIN
IF auth.uid() IS NULL OR NOT public.can_edit_workspace() THEN RAISE EXCEPTION 'Only analysts and admins may convert contributions' USING ERRCODE='42501'; END IF;
SELECT * INTO c FROM public.contributions WHERE id=contribution_id;
IF NOT FOUND THEN RAISE EXCEPTION 'Contribution not found' USING ERRCODE='23514'; END IF;
IF btrim(coalesce(evidence_code,''))='' OR btrim(coalesce(evidence_title,''))='' THEN RAISE EXCEPTION 'Evidence code and title are required' USING ERRCODE='23514'; END IF;
INSERT INTO public.evidence_items(job_role_id,code,title,source_type,excerpt,source_reference,added_by) VALUES(c.job_role_id,evidence_code,evidence_title,'sme_interview',c.content,'Contribution '||c.id::text,auth.uid()) RETURNING id INTO eid;
RETURN eid;
END $$;
REVOKE ALL ON FUNCTION public.convert_contribution_to_evidence(uuid,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.convert_contribution_to_evidence(uuid,text,text) TO authenticated,service_role;