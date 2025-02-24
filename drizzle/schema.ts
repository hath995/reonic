import { pgTable, serial, varchar, foreignKey, time, timestamp, boolean, integer, index, doublePrecision, json } from "drizzle-orm/pg-core"
import type { SimulationSettings } from "../shared_types"

export const simulations = pgTable("simulations", {
    id: serial().primaryKey().notNull(),
    name: varchar({length: 255}),
    seed: integer().notNull().default(1),
});

export const arrivalProbabilities = pgTable("arrival_probabilities", {
    id: serial().primaryKey().notNull(),
    simulationId: integer("simulation_id").notNull(),
    periodStart: time("period_start").notNull(),
    periodEnd: time("period_end").notNull(),
    probability: doublePrecision().notNull(),
}, (table) => [
    foreignKey({
        columns: [table.simulationId],
        foreignColumns: [simulations.id],
        name: "simulation_id_fk",
    }),
    index("simulation_id_arr_index").on(table.simulationId)
]);

export const demandProbabilities = pgTable("demand_probabilities", {
    id: serial().primaryKey().notNull(),
    simulationId: integer("simulation_id").notNull(),
    demand: integer().notNull(),
    probability: doublePrecision().notNull(),
}, (table) => [
    foreignKey({
        columns: [table.simulationId],
        foreignColumns: [simulations.id],
        name: "simulation_id_fk",
    }),
    index("simulation_id_demand_index").on(table.simulationId)
]);

export const simulationSettings = pgTable("simulation_settings", {
    id: serial().primaryKey().notNull(),
    simulationId: integer("simulation_id").notNull(),
    settings: json().$type<SimulationSettings>(),
}, (table) => [
    foreignKey({
        columns: [table.simulationId],
        foreignColumns: [simulations.id],
        name: "simulation_settings_id_fk",
    }),
    index("simulation_id_index").on(table.simulationId)
]);

export const cars = pgTable("cars", {
    localId: integer().notNull(),
    simulationId: integer("simulation_id").notNull(),
    demand: integer().notNull(),
}, (table) => [
    foreignKey({
        columns: [table.simulationId],
        foreignColumns: [simulations.id],
        name: "simulation_id_fk",
    }),
    index("simulation_id_car_index").on(table.simulationId)
]);

export const chargePorts = pgTable("charge_ports", {
    id: serial().primaryKey().notNull(),
    simulationId: integer("simulation_id").notNull(),
    localId: integer("local_id").notNull(),
}, (table) => [
    foreignKey({
        columns: [table.simulationId],
        foreignColumns: [simulations.id],
        name: "simulation_id_fk",
    }),
    index("simulation_id_cp_index").on(table.simulationId)
]);

export const chargingPortRecords = pgTable("charging_port_records", {
    id: serial().primaryKey().notNull(),
    simulationId: integer("simulation_id").notNull(),
    chargePortID: integer("charge_port_id").notNull(),
    carID: integer("car_id").notNull(),
    demandKw: doublePrecision("demand_kw").notNull(),
    ts: timestamp().notNull(),
}, (table) => [
    foreignKey({
        columns: [table.simulationId],
        foreignColumns: [simulations.id],
        name: "simulation_id_fk",
    }),
    foreignKey({
        columns: [table.chargePortID],
        foreignColumns: [chargePorts.id],
        name: "charge_port_id_fk",
    }),
    index("simulation_id_cp_record_index").on(table.simulationId),
    index("charge_port_ts_index").on(table.ts)
]);

export const simulationResumption = pgTable("simulation_resumption", {
    id: serial().primaryKey().notNull(),
    simulationId: integer("simulation_id").notNull(),
    ts: timestamp().notNull(),
    seed: integer().notNull()
}, (table) => [
    foreignKey({
        columns: [table.simulationId],
        foreignColumns: [simulations.id],
        name: "simulation_id_fk",
    }),
    index("simulation_id_resumption_index").on(table.simulationId),
    index("simulation_id_resumption_ts_index").on(table.ts)
]);