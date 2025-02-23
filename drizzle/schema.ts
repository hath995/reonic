import { pgTable, serial, varchar, foreignKey, time, timestamp, boolean, integer, index, doublePrecision, json } from "drizzle-orm/pg-core"
import type { SimulationSettings } from "../shared_types"

export const simulations = pgTable("simulations", {
    id: serial().primaryKey().notNull(),
    name: varchar({length: 255})
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

