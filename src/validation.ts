import z from 'zod';

export const simulationSchema = z.object({
    id: z.number().optional(),
    name: z.string(),
    seed: z.number().optional(),
});

// export const simulationSettingKeys = z.enum(["chargePoints", "consumptionPer100Km", "chargePointWatts", "arrivalMultiplier"]);
export const simulationSettingsSchema = z.object({
    id: z.number().optional(),
    simulationId: z.number().optional(),
    settings: z.object({
        chargePoints: z.number(),
        consumptionPer100Km: z.number(),
        chargePointWatts: z.number(),
        arrivalMultiplier: z.number(),
    }),
})
export const simulationSettingsUpdateSchema = z.array(z.tuple([simulationSettingsSchema.shape.settings.keyof(), z.number()]));

export const demandProbabilitySchema = z.array(z.object({
    id: z.number(),
    simulationId: z.number(),
    demand: z.number(),
    probability: z.number(),
}));

export const demandProbabilitySchemaPartial = z.array(z.object({
    demand: z.number(),
    probability: z.number(),
}));

export const arrivalProbabilitySchema = z.array(z.object({
    id: z.number(),
    simulationId: z.number(),
    periodStart: z.string().regex(/^\d{2}:\d{2}$/),
    periodEnd: z.string().regex(/^\d{2}:\d{2}$/),
    probability: z.number(),
}));
const timestamp_regex = /^\d{4}-\d{2}-\d{2}.\d{2}:\d{2}:\d{2}(.\d{3})?Z?$/;
export const simulationRequestSchema = z.object({
    start_timestamp: z.string().regex(timestamp_regex),
    end_timestamp: z.string().regex(timestamp_regex),
});