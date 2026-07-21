-- public.matches definition

-- Drop table

-- DROP TABLE public.matches;

CREATE TABLE public.matches (
	match_id serial4 NOT NULL,
	tournament_id int4 NULL,
	team_one int4 NULL,
	team_two int4 NULL,
	venue varchar(150) NULL,
	match_date timestamp NULL,
	status varchar(30) NULL,
	created_time timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT matches_pkey PRIMARY KEY (match_id),
	CONSTRAINT matches_team_one_fkey FOREIGN KEY (team_one) REFERENCES public.teams(team_id),
	CONSTRAINT matches_team_two_fkey FOREIGN KEY (team_two) REFERENCES public.teams(team_id),
	CONSTRAINT matches_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES public.tournaments(tournament_id)
);