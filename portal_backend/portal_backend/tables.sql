CREATE TABLE released_trains_info (
	ID varchar(50) NOT NULL,
	train_no int,
	journey_date DATE,	
	AC_coach_count	int,
	SL_coach_count int
);

-- Break this table also into several small tables due to huge dataset
CREATE TABLE agent_R (
	ID varchar(50) NOT NULL,
	agent_username varchar(50),
	name varchar(50),
	credit_card_no int,
	address varchar(255)
);

-- all passengers with name starting from R, will be saved here for journey date = July 1, 2021

CREATE TABLE R_010721 (
	ID varchar(50) NOT NULL,
	PNR_no int,
	passenger_name varchar(50),
	age int,
	gender varchar(10),
	agent_username varchar(50),
);

-- all passengers with name starting from S, will be saved here for journey date = July 1, 2021

CREATE TABLE S_010721 (
	ID varchar(50) NOT NULL,
	PNR_no int,
	passenger_name varchar(50),
	age int,
	gender varchar(10),
	agent_username varchar(50),
);

-- 12345 is five digit train no. and 010721 is JourneyDate = July 1, 2021
 
CREATE TABLE 12345_010721 (
	ID varchar(50) NOT NULL,
	berth_no int,
	PNR_no int,
	train_no int,
	coach_no int,
	coach_type varchar(3),
	berth_type varchar(3),
	start_location varchar(255),
	end_location varchar(255),
	journey_date DATE,
	passenger_name varchar(50),
	PRIMARY KEY (ID)

);
