CREATE FUNCTION public.assessment_analysis_ready(v jsonb) RETURNS boolean LANGUAGE sql IMMUTABLE AS $$ SELECT jsonb_array_length(v->'ratings')>0 AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(v->'ratings') r WHERE (r->>'importance')::numeric NOT BETWEEN 1 AND 5 OR (r->>'frequency')::numeric NOT BETWEEN 1 AND 5) AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(v->'ratings') r GROUP BY r->>'element_id' HAVING count(DISTINCT r->>'source_id')<CASE WHEN (v->>'incumbents')::integer=1 THEN 1 ELSE 2 END OR count(DISTINCT r->>'applies')>1 OR count(DISTINCT r->>'entry')>1) AND (SELECT count(DISTINCT i->>'source_id') FROM jsonb_array_elements(v->'incidents') i WHERE btrim(i->>'situation')<>'' AND btrim(i->>'actions')<>'' AND btrim(i->>'outcome')<>'' AND btrim(i->>'poor')<>'' AND btrim(i->>'decisions')<>'' AND btrim(i->>'approvals')<>'' AND btrim(i->>'limits')<>'')>=CASE WHEN (v->>'incumbents')::integer=1 THEN 1 ELSE 2 END AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(v->'conflicts') c WHERE NOT (c->>'resolved')::boolean) $$;
CREATE FUNCTION public.assessment_ready(v jsonb) RETURNS boolean LANGUAGE plpgsql IMMUTABLE AS $$ DECLARE k record;m jsonb;i jsonb;method text;BEGIN
IF NOT public.assessment_analysis_ready(v) OR v->>'analysis_status'<>'approved' OR jsonb_array_length(v->'items')=0 THEN RETURN false;END IF;
FOR k IN SELECT r->>'element_id' AS eid,avg((r->>'importance')::numeric) AS importance,bool_and((r->>'entry')::boolean AND (r->>'applies')::boolean) AS eligible FROM jsonb_array_elements(v->'ratings') r GROUP BY r->>'element_id' LOOP
IF k.eligible AND k.importance>=4 AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(v->'benchmark') b WHERE b->>'id'=k.eid AND b->>'kind' IN ('task','tool')) THEN
SELECT value INTO m FROM jsonb_array_elements(v->'mappings') WHERE value->>'element_id'=k.eid;
IF m IS NULL OR jsonb_array_length(m->'methods')=0 THEN RETURN false;END IF;
FOR method IN SELECT jsonb_array_elements_text(m->'methods') LOOP
IF method='interview' AND btrim(m->>'rationale')='' THEN RETURN false;END IF;
IF NOT EXISTS(SELECT 1 FROM jsonb_array_elements(v->'items') i WHERE i->>'status'='approved' AND i->>'method'=method AND NOT (i->>'practice')::boolean AND i->'ksao_ids' ? k.eid) THEN RETURN false;END IF;
END LOOP;END IF;END LOOP;
FOR i IN SELECT value FROM jsonb_array_elements(v->'items') WHERE value->>'status'<>'retired' LOOP
IF i->>'status'<>'approved' OR jsonb_array_length(i->'approvals')=0 OR btrim(i->>'time_rationale')='' THEN RETURN false;END IF;
IF i->>'method' IN ('aptitude','knowledge','sjt') AND NOT (i->>'practice')::boolean AND (SELECT count(DISTINCT e->>'source_id') FROM jsonb_array_elements(v->'angoff') e WHERE e->>'item_id'=i->>'id')<2 THEN RETURN false;END IF;
END LOOP;
IF EXISTS(SELECT 1 FROM jsonb_array_elements(v->'angoff') e WHERE (e->>'percent')::numeric NOT BETWEEN 0 AND 100) THEN RETURN false;END IF;RETURN true;END $$;
REVOKE ALL ON FUNCTION public.assessment_analysis_ready(jsonb),public.assessment_ready(jsonb) FROM PUBLIC,anon;GRANT EXECUTE ON FUNCTION public.assessment_analysis_ready(jsonb),public.assessment_ready(jsonb) TO authenticated,service_role;