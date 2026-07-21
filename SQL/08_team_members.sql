-- public.team_members definition

-- Drop table

-- DROP TABLE public.team_members;

CREATE TABLE public.team_members (
	team_member_id serial4 NOT NULL,
	team_id int4 NOT NULL,
	student_id int4 NOT NULL,
	joined_date date DEFAULT CURRENT_DATE NULL,
	CONSTRAINT team_members_pkey PRIMARY KEY (team_member_id),
	CONSTRAINT team_members_team_id_student_id_key UNIQUE (team_id, student_id),
	CONSTRAINT team_members_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users_form(id) ON DELETE CASCADE,
	CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(team_id) ON DELETE CASCADE
);