CREATE FUNCTION public.assessment_candidate_action(token text,command text,payload jsonb DEFAULT '{}') RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE a assessment_attempts;b assessment_batteries;i jsonb;items jsonb;section text;deadline timestamptz;minutes integer;BEGIN
PERFORM pg_advisory_xact_lock(811112026);SELECT * INTO a FROM assessment_attempts WHERE token_hash=token FOR UPDATE;
IF a.id IS NULL OR a.revoked OR a.expires_at<now() THEN RAISE EXCEPTION 'Invitation unavailable or expired'; END IF;
SELECT * INTO b FROM assessment_batteries WHERE id=a.battery_id;IF b.status<>'approved' THEN RAISE EXCEPTION 'Battery not approved';END IF;
IF command='accommodation' THEN IF a.status<>'invited' THEN RAISE EXCEPTION 'Request accommodation before starting';END IF;UPDATE assessment_attempts SET accommodation_request=left(payload->>'request',2000) WHERE id=a.id;END IF;
IF command='demographic' THEN INSERT INTO assessment_demographics(attempt_id,group_label) VALUES(a.id,left(coalesce(payload->>'group',''),100)) ON CONFLICT(attempt_id) DO UPDATE SET group_label=excluded.group_label;END IF;
IF command='start' THEN
IF a.status IN ('submitted','scored') THEN RAISE EXCEPTION 'Already submitted';END IF;
IF btrim(a.accommodation_request)<>'' AND a.extra_minutes=0 AND btrim(a.alternate_format)='' THEN RAISE EXCEPTION 'Accommodation request awaiting staff response';END IF;
section:=payload->>'section';SELECT sum((value->>'minutes')::integer) INTO minutes FROM jsonb_array_elements(b.payload->'items') WHERE value->>'section'=section AND value->>'status'='approved' AND NOT (value->>'practice')::boolean;
IF minutes IS NULL THEN RAISE EXCEPTION 'Unknown section';END IF;
IF a.current_section IS NOT NULL AND a.current_section<>section AND (a.section_deadlines->>a.current_section)::timestamptz>now() THEN RAISE EXCEPTION 'Finish the current section first';END IF;
IF a.section_deadlines ? section THEN deadline:=(a.section_deadlines->>section)::timestamptz;ELSE deadline:=now()+make_interval(mins=>minutes+a.extra_minutes);END IF;
UPDATE assessment_attempts SET status='in_progress',current_section=section,section_deadlines=a.section_deadlines||jsonb_build_object(section,deadline) WHERE id=a.id;
END IF;
IF command='save' THEN
IF a.status<>'in_progress' THEN RAISE EXCEPTION 'No active attempt';END IF;
section:=a.current_section;deadline:=(a.section_deadlines->>section)::timestamptz;IF deadline IS NULL OR now()>deadline THEN RAISE EXCEPTION 'Section time ended';END IF;
FOR i IN SELECT value FROM jsonb_array_elements(b.payload->'items') WHERE value->>'section'=section AND value->>'status'='approved' AND NOT (value->>'practice')::boolean LOOP
IF payload->'answers' ? (i->>'id') THEN a.answers:=a.answers||jsonb_build_object(i->>'id',left(payload->'answers'->>(i->>'id'),12000));END IF;
END LOOP;UPDATE assessment_attempts SET answers=a.answers WHERE id=a.id;
END IF;
IF command='finish_section' THEN UPDATE assessment_attempts SET current_section=NULL WHERE id=a.id;END IF;
IF command='submit' AND a.status NOT IN ('submitted','scored') THEN UPDATE assessment_attempts SET status='submitted',submitted_at=now(),current_section=NULL WHERE id=a.id;END IF;
SELECT * INTO a FROM assessment_attempts WHERE id=a.id;
SELECT jsonb_agg(value-ARRAY['correct','key','explanation','approvals','task_ids','ksao_ids','incident_id']) INTO items FROM jsonb_array_elements(b.payload->'items') WHERE value->>'status'='approved';
RETURN jsonb_build_object('id',a.id,'name',a.name,'status',a.status,'title',b.payload->>'title','organization',b.payload->>'organization','items',items,'answers',a.answers,'deadlines',a.section_deadlines,'current_section',a.current_section,'extra_minutes',a.extra_minutes,'alternate_format',a.alternate_format,'server_time',now());END $$;
REVOKE ALL ON FUNCTION public.assessment_candidate_action(text,text,jsonb) FROM PUBLIC,anon,authenticated;GRANT EXECUTE ON FUNCTION public.assessment_candidate_action(text,text,jsonb) TO service_role;