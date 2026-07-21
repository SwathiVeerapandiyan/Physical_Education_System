-- public.tournaments definition

-- Drop table

-- DROP TABLE public.tournaments;

CREATE TABLE public.tournaments (
	tournament_id serial4 NOT NULL,
	tournament_name varchar(150) NOT NULL,
	organizer varchar(150) NULL,
	venue varchar(150) NULL,
	start_date date NULL,
	end_date date NULL,
	status varchar(30) NULL,
	created_time timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_time timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT tournaments_pkey PRIMARY KEY (tournament_id)
);