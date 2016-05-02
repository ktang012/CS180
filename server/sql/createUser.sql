BEGIN
if ( select exists (select 1 from User where username = p_username) ) THEN

    select 'Username Exists !!';

ELSE

insert into User
(
    username
)

values
(
    p_username
);

END IF;
END
