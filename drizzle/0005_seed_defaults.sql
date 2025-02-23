-- Custom SQL migration file, put your code below! --
insert into simulations (id, name) values (0, 'Default Simulation');
/*
00:00 - 01:00 00 0.94 %
01:00 - 02:00 0.94 %
02:00 - 03:00 0.94 %
03:00 - 04:00 0.94 %
04:00 - 05:00 0.94 %
05:00 - 06:00 0.94 %
06:00 - 07:00 0.94 %
07:00 - 08:00 0.94 %
08:00 - 09:00 2.83 %
09:00 - 10:00 2.83 %
10:00 - 11:00 5.66 %
11:00 - 12:00 5.66 %
12:00 - 13:00 5.66 %
13:00 - 14:00 7.55 %
14:00 - 15:00 7.55 %
15:00 - 16:00 7.55 %
16:00 - 17:00 10.38 %
17:00 - 18:00 10.38 %
18:00 - 19:00 10.38 %
19:00 - 20:00 4.72 %
21:00 - 22:00 4.72 %
22:00 - 23:00 0.94 %
23:00 - 24:00 0.94 %
*/
insert into arrival_probabilities (simulation_id, period_start, period_end, probability) values (0, '00:00', '01:00', 0.0094);
insert into arrival_probabilities (simulation_id, period_start, period_end, probability) values (0, '01:00', '02:00', 0.0094);
insert into arrival_probabilities (simulation_id, period_start, period_end, probability) values (0, '02:00', '03:00', 0.0094);
insert into arrival_probabilities (simulation_id, period_start, period_end, probability) values (0, '03:00', '04:00', 0.0094);
insert into arrival_probabilities (simulation_id, period_start, period_end, probability) values (0, '04:00', '05:00', 0.0094);
insert into arrival_probabilities (simulation_id, period_start, period_end, probability) values (0, '05:00', '06:00', 0.0094);
insert into arrival_probabilities (simulation_id, period_start, period_end, probability) values (0, '06:00', '07:00', 0.0094);
insert into arrival_probabilities (simulation_id, period_start, period_end, probability) values (0, '07:00', '08:00', 0.0094);

insert into arrival_probabilities (simulation_id, period_start, period_end, probability) values (0, '08:00', '09:00', 0.0283);
insert into arrival_probabilities (simulation_id, period_start, period_end, probability) values (0, '09:00', '10:00', 0.0283);

insert into arrival_probabilities (simulation_id, period_start, period_end, probability) values (0, '10:00', '11:00', 0.0566);
insert into arrival_probabilities (simulation_id, period_start, period_end, probability) values (0, '11:00', '12:00', 0.0566);
insert into arrival_probabilities (simulation_id, period_start, period_end, probability) values (0, '12:00', '13:00', 0.0566);

insert into arrival_probabilities (simulation_id, period_start, period_end, probability) values (0, '13:00', '14:00', 0.0755);
insert into arrival_probabilities (simulation_id, period_start, period_end, probability) values (0, '14:00', '15:00', 0.0755);
insert into arrival_probabilities (simulation_id, period_start, period_end, probability) values (0, '15:00', '16:00', 0.0755);

insert into arrival_probabilities (simulation_id, period_start, period_end, probability) values (0, '16:00', '17:00', 0.1038);
insert into arrival_probabilities (simulation_id, period_start, period_end, probability) values (0, '17:00', '18:00', 0.1038);
insert into arrival_probabilities (simulation_id, period_start, period_end, probability) values (0, '18:00', '19:00', 0.1038);

insert into arrival_probabilities (simulation_id, period_start, period_end, probability) values (0, '19:00', '20:00', 0.0472);
insert into arrival_probabilities (simulation_id, period_start, period_end, probability) values (0, '20:00', '21:00', 0.0472);
insert into arrival_probabilities (simulation_id, period_start, period_end, probability) values (0, '21:00', '22:00', 0.0472);

insert into arrival_probabilities (simulation_id, period_start, period_end, probability) values (0, '22:00', '23:00', 0.0094);
insert into arrival_probabilities (simulation_id, period_start, period_end, probability) values (0, '23:00', '00:00', 0.0094);

/*
T1: Charging demand probabilities
34.31 % None (doesn't charge)
4.90 % 5.0 km
9.80 % 10.0 km
11.76 % 20.0 km
8.82 % 30.0 km
11.76 % 50.0 km
10.78 % 100.0 km
4.90 % 200.0 km
2.94 % 300.0 km
*/
insert into demand_probabilities (simulation_id, demand, probability) values (0, 0, 0.3431);
insert into demand_probabilities (simulation_id, demand, probability) values (0, 5, 0.0490);
insert into demand_probabilities (simulation_id, demand, probability) values (0, 10, 0.0980);
insert into demand_probabilities (simulation_id, demand, probability) values (0, 20, 0.1176);
insert into demand_probabilities (simulation_id, demand, probability) values (0, 30, 0.0882);
insert into demand_probabilities (simulation_id, demand, probability) values (0, 50, 0.1176);
insert into demand_probabilities (simulation_id, demand, probability) values (0, 100, 0.1078);
insert into demand_probabilities (simulation_id, demand, probability) values (0, 200, 0.0490);
insert into demand_probabilities (simulation_id, demand, probability) values (0, 300, 0.0294);

insert into simulation_settings (simulation_id, settings) values (0, '{"chargePoints": 20, "consumptionPer100Km": 18000, "chargePointWatts": 11000, "arrivalMultiplier": 1.0}');