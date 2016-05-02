BEGIN

if(p_status = 0) THEN
UPDATE Tasks set status = 1 WHERE taskid = p_taskid;
ELSE
UPDATE Tasks set status = 0 WHERE taskid = p_taskid;

END IF;

END
