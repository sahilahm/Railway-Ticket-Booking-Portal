CREATE TABLE agents(
    ID SERIAL PRIMARY KEY,
    username VARCHAR(100),
    email VARCHAR(255),
    password VARCHAR(100)
);

CREATE TABLE admin(
	ID SERIAL PRIMARY KEY,
    TrainNO VARCHAR(6),
    DOJ DATE,
    NO_SL SMALLINT,
    NO_AC SMALLINT
);

CREATE TABLE _DOJTrainNO(
    Available_ac INTEGER,
    Available_sl INTEGER    
)

CREATE TABLE DOJTrainNO_Active(
    PNR VARCHAR(17) UNIQUE,
    name VARCHAR(100),
    age INTEGER,
    gender VARCHAR(7),
    coach_type VARCHAR(3),
    caoch_number VARCHAR(3),
    berth_number INTEGER,
    berth_type VARCHAR(3),
)


//-------Triggers---------------------------------

