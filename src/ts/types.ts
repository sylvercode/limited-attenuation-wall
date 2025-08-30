import ClockwiseSweepPolygonPatch from "./apps/clockwise_sweep_polygon_patch";
import * as dogBrowserApp from "./apps/dog_browser";
import type { LibWrapperWrapperDefinitions } from "fvtt-lib-wrapper-types";
import { HookDefinitions } from "fvtt-hook-attacher";
import * as RenderWallConfigPatchApp from "./apps/render_wall_config_patch";
import { LimitedAttenuationWallFlagsDataModel } from "./apps/limited_attenuation_wall_flags_data_model";


export interface SylvercodeEnhanceLimitedWallModule
  extends foundry.packages.Module, dogBrowserApp.DogBrowserHandle {

}

export type OnInitModuleFunc = (module: SylvercodeEnhanceLimitedWallModule) => void;

export class SylvercodeEnhanceLimitedWallModuleHooks {
  static ON_INIT_MODULE_CALLBACKS: Iterable<OnInitModuleFunc> = [
    dogBrowserApp.onInitHandle,
  ];

  static LIBWRAPPER_PATCHS: Iterable<LibWrapperWrapperDefinitions> = [
    ...ClockwiseSweepPolygonPatch.LIBWRAPPER_PATCHS,
  ];

  static HOOKS_DEFINITIONS_SET: HookDefinitions[] = [
    dogBrowserApp.HOOKS_DEFINITIONS,
    ...LimitedAttenuationWallFlagsDataModel.HOOKS_DEFINITIONS,
    ...RenderWallConfigPatchApp.HOOKS_DEFINITIONS,
  ]
}
