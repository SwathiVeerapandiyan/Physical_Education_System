-- public.teams definition

-- Drop table

-- DROP TABLE public.teams;

CREATE TABLE public.teams (
	team_id serial4 NOT NULL,
	team_name varchar(100) NOT NULL,
	sport_id int4 NOT NULL,
	created_time timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_time timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT teams_pkey PRIMARY KEY (team_id),
	CONSTRAINT teams_sport_id_fkey FOREIGN KEY (sport_id) REFERENCES public.sports_details(sport_id)
);