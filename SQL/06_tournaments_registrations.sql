-- public.tournament_registrations definition

-- Drop table

-- DROP TABLE public.tournament_registrations;

CREATE TABLE public.tournament_registrations (
	registration_id serial4 NOT NULL,
	tournament_id int4 NOT NULL,
	team_id int4 NOT NULL,
	registration_date timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	status varchar(30) DEFAULT 'Pending'::character varying NULL,
	CONSTRAINT tournament_registrations_pkey PRIMARY KEY (registration_id),
	CONSTRAINT tournament_registrations_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(team_id),
	CONSTRAINT tournament_registrations_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES public.tournaments(tournament_id)
);