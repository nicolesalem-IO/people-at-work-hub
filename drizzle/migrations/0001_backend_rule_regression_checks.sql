CREATE FUNCTION public.test_workspace_rule(test_name text) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE jid uuid:='10000000-0000-4000-8000-000000000001'; aid uuid:='30000000-0000-4000-8000-000000000001'; pid uuid:='60000000-0000-4000-8000-000000000001'; mid uuid; draft_id uuid; caught boolean:=false; table_count integer;
BEGIN
IF test_name='rls' THEN
SELECT count(*) INTO table_count FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' AND c.relname IN ('profiles','user_roles','job_roles','evidence_items','contributions','role_analysis_versions','competencies','competency_evidence','evidence_conflicts','conflict_evidence','hiring_packages','package_materials','material_citations','approvals','activity_log') AND c.relrowsecurity AND EXISTS(SELECT 1 FROM pg_policies p WHERE p.schemaname='public' AND p.tablename=c.relname AND p.policyname='signed_in_read') AND NOT has_table_privilege('anon',c.oid,'SELECT');
RETURN table_count=15;
END IF;
BEGIN
PERFORM set_config('request.jwt.claims','{}',true);
IF test_name='approved_analysis' THEN
INSERT INTO role_analysis_versions(job_role_id,version_number) VALUES(jid,900001) RETURNING id INTO draft_id;
ELSIF test_name IN ('immutable_material','reviewer_material') THEN
INSERT INTO package_materials(package_id,material_type,version_label,content) VALUES(pid,'work_sample','regression-check','Triage inbound tickets.') RETURNING id INTO mid;
INSERT INTO material_citations(material_id,statement,evidence_id) VALUES(mid,'Triage inbound tickets.','20000000-0000-4000-8000-000000000005');
IF test_name='immutable_material' THEN UPDATE package_materials SET status='approved' WHERE id=mid; END IF;
ELSIF test_name='reviewer_decision' THEN
INSERT INTO role_analysis_versions(job_role_id,version_number,status) VALUES(jid,900002,'in_review') RETURNING id INTO draft_id;
INSERT INTO approvals(entity_type,entity_id) VALUES('role_analysis_version',draft_id) RETURNING id INTO mid;
END IF;
IF test_name LIKE 'reviewer_%' THEN
PERFORM set_config('request.jwt.claims','{"role":"authenticated","sub":"99999999-0000-4000-8000-000000000001"}',true);
END IF;
BEGIN
CASE test_name
WHEN 'approved_analysis' THEN INSERT INTO hiring_packages(job_role_id,analysis_version_id) VALUES(jid,draft_id);
WHEN 'reviewer_analysis' THEN INSERT INTO role_analysis_versions(job_role_id,version_number,status) VALUES(jid,900003,'approved');
WHEN 'reviewer_package' THEN UPDATE hiring_packages SET status='approved' WHERE id=pid;
WHEN 'reviewer_material' THEN UPDATE package_materials SET status='approved' WHERE id=mid;
WHEN 'reviewer_decision' THEN UPDATE approvals SET decision='approved' WHERE id=mid;
WHEN 'open_conflict' THEN UPDATE hiring_packages SET status='submitted' WHERE id=pid;
WHEN 'immutable_analysis' THEN UPDATE role_analysis_versions SET summary='must not change' WHERE id=aid;
WHEN 'immutable_material' THEN UPDATE package_materials SET content='must not change' WHERE id=mid;
WHEN 'importance' THEN INSERT INTO competencies(analysis_version_id,name,definition,importance) VALUES(aid,'invalid','invalid',6);
ELSE RAISE EXCEPTION 'Unknown regression check';
END CASE;
EXCEPTION WHEN check_violation OR insufficient_privilege THEN caught:=true;
END;
RAISE EXCEPTION USING ERRCODE='P0002',MESSAGE='rollback regression fixtures';
EXCEPTION WHEN no_data_found THEN NULL;
END;
RETURN caught;
END $$;
REVOKE ALL ON FUNCTION public.test_workspace_rule(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.test_workspace_rule(text) TO service_role;
COMMENT ON FUNCTION public.test_workspace_rule(text) IS 'Privileged regression checks. All writes execute within an exception subtransaction and roll back; no clients can invoke this helper.';