import { HookDefinitions } from "fvtt-hook-attacher";
import ApplicationV2 from "node_modules/fvtt-types/src/foundry/client/applications/api/application.mjs";
import { MODULE_ID } from "../constants";

const ATTENUATION_RATIO_FIELD = "attenuationRatio";

declare module "fvtt-types/configuration" {
    interface FlagConfig {
        Wall: {
            [MODULE_ID]?: {
                [ATTENUATION_RATIO_FIELD]?: number;
            };
        };
    }
}

export class WallConfigPatch {

    static getWallFlags(wallDoc: WallDocument): FlagConfig["Wall"] {
        const data = {
            sylvercodeEnhanceLimitedWall: {
                attenuationRatio: wallDoc.getFlag(MODULE_ID, ATTENUATION_RATIO_FIELD) ?? 0.5
            }
        };
        return data;
    }

    static async render(
        application: WallConfig,
        element: HTMLElement,
        context: ApplicationV2.RenderContextOf<WallConfig>,
        options: ApplicationV2.RenderOptionsOf<WallConfig>) {
        console.log("RenderWallConfigPatch: OnRenderWallConfig");
        console.log({ application, element, context, options });

        const wallFlags = WallConfigPatch.getWallFlags(context.document);

        const newDivHtml = await foundry.applications.handlebars.renderTemplate(
            `modules/${MODULE_ID}/templates/limited_attenuation_wall_config.hbs`,
            { flags: wallFlags });

        const content = element.querySelector(".window-content");
        if (!content) {
            console.error("Could not find .window-content element");
            return;
        }

        const fieldset = content.querySelector('fieldset:has(select[name="sight"])');
        if (!fieldset) {
            console.error('Could not find fieldset containing select[name="sight"]');
            return;
        }

        fieldset.insertAdjacentHTML('beforeend', newDivHtml);
    }
}

export const HOOKS_DEFINITIONS: HookDefinitions = {
    on: {
        name: "renderWallConfig",
        callback: WallConfigPatch.render
    }
};
