REVOKE ALL ON TABLE public.profiles,public.user_roles,public.job_roles,public.evidence_items,public.contributions,public.role_analysis_versions,public.competencies,public.competency_evidence,public.evidence_conflicts,public.conflict_evidence,public.hiring_packages,public.package_materials,public.material_citations,public.approvals,public.activity_log FROM anon,PUBLIC;
REVOKE ALL ON FUNCTION public.test_workspace_rule(text) FROM supabase_read_only_user;
REVOKE INSERT,DELETE,TRUNCATE,REFERENCES,TRIGGER ON public.profiles FROM authenticated;
REVOKE UPDATE ON public.profiles FROM authenticated; GRANT UPDATE(full_name) ON public.profiles TO authenticated;
REVOKE UPDATE,TRUNCATE,REFERENCES,TRIGGER ON public.user_roles FROM authenticated;
REVOKE UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER ON public.contributions FROM authenticated;
REVOKE INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER ON public.activity_log FROM authenticated;
REVOKE DELETE,TRUNCATE,REFERENCES,TRIGGER ON public.approvals FROM authenticated;