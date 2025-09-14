import { HookDefinitions } from "fvtt-hook-attacher";
import { MODULE_ID, UPPER_MODULE_ID } from "../constants";
import type { BooleanField, DataSchema, NumberField } from "fvtt-types/src/foundry/common/data/fields.mjs";


/**
 * Options for the limited attenuation ratio number field.
 */
export const LIMITED_ATTENUATION_RATIO_FIELD_OPTIONS = { min: 0.05, max: 0.95, step: 0.05, nullable: true };

/**
 * Enum of the names of the wall flags used for limited attenuation.
 */
export enum LimitedAttenuationWallFlagNames {
    hasLimitedAttenuation = "hasLimitedAttenuation",
    limitedAttenuationRatio = "limitedAttenuationRatio"
}

/**
 * Interface for the wall flags used by the Limited Attenuation Wall module.
 */
export interface LimitedAttenuationWallFlags {
    [LimitedAttenuationWallFlagNames.hasLimitedAttenuation]: boolean
    [LimitedAttenuationWallFlagNames.limitedAttenuationRatio]: number
};

declare module "fvtt-types/configuration" {
    interface FlagConfig {
        Wall: {
            [MODULE_ID]?: LimitedAttenuationWallFlags
        };
    }
}

interface LimitedAttenuationFlagsSchema extends DataSchema {
    [LimitedAttenuationWallFlagNames.hasLimitedAttenuation]: BooleanField,
    [LimitedAttenuationWallFlagNames.limitedAttenuationRatio]: NumberField
}

/**
 * Data model for the limited attenuation wall flags, including schema and hooks.
 */
export class LimitedAttenuationWallFlagsDataModel extends foundry.abstract.DataModel<LimitedAttenuationFlagsSchema> {
    /**
     * @inheritdoc
     */
    static override LOCALIZATION_PREFIXES = [`${UPPER_MODULE_ID}.LimitedAttenuationWallFlags`];

    /**
     * @inheritdoc
     */
    static i18nInit() {
        foundry.helpers.Localization.localizeDataModel(LimitedAttenuationWallFlagsDataModel);
    }

    /**
     * Constructs a new LimitedAttenuationWallFlagsDataModel for a given wall document.
     * @param wallDocument The wall document to use for the data model.
     */
    constructor(wallDocument: WallDocument) {
        super(wallDocument.flags[MODULE_ID]);
        this.schema.name = MODULE_ID;
        this.schema.parent = wallDocument.schema.fields.flags;
    }

    /**
     * @inheritdoc
     */
    static override defineSchema() {
        return {
            [LimitedAttenuationWallFlagNames.hasLimitedAttenuation]: new foundry.data.fields.BooleanField(
                { initial: false },
                { name: LimitedAttenuationWallFlagNames.hasLimitedAttenuation }),
            [LimitedAttenuationWallFlagNames.limitedAttenuationRatio]: new foundry.data.fields.NumberField(
                LIMITED_ATTENUATION_RATIO_FIELD_OPTIONS,
                { name: LimitedAttenuationWallFlagNames.limitedAttenuationRatio })
        }
    }
}

/**
 * Iterable of hook definitions for this data model.
 */
export const HOOKS_DEFINITIONS: Iterable<HookDefinitions> = [{
    on: [{
        name: "i18nInit",
        callback: LimitedAttenuationWallFlagsDataModel.i18nInit
    }]
}];
