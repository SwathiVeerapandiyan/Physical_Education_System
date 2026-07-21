-- public.sports_details definition

-- Drop table

-- DROP TABLE public.sports_details;

CREATE TABLE public.sports_details (
	sport_id serial4 NOT NULL,
	sport_name varchar(100) NOT NULL,
	category varchar(50) NULL,
	coach_name varchar(100) NULL,
	description text NULL,
	created_time timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_time timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT sports_details_pkey PRIMARY KEY (sport_id),
	CONSTRAINT sports_details_sport_name_key UNIQUE (sport_name)
);