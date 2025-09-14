import type { LibWrapperWrapperDefinitions } from "fvtt-lib-wrapper-types";
import { HookDefinitions } from "fvtt-hook-attacher";
import * as ClockwiseSweepPolygonPatch from "./apps/clockwise_sweep_polygon_patch";
import * as RenderWallConfigPatchApp from "./apps/render_wall_config_patch";
import { LimitedAttenuationWallFlagsDataModel } from "./apps/limited_attenuation_wall_flags_data_model";
import * as LimitedAttenuationWallSettings from "./apps/limited_attenuation_wall_settings";


export interface LimitedAttenuationWallModule
  extends foundry.packages.Module {

}

export type OnInitModuleFunc = (module: LimitedAttenuationWallModule) => void;

export class LimitedAttenuationWallModuleHooks {
  static ON_INIT_MODULE_CALLBACKS: Iterable<OnInitModuleFunc> = [
    LimitedAttenuationWallSettings.onInitHandle
  ];

  static LIBWRAPPER_PATCHS: Iterable<LibWrapperWrapperDefinitions> = [
    ...ClockwiseSweepPolygonPatch.LIBWRAPPER_PATCHS,
  ];

  static HOOKS_DEFINITIONS_SET: HookDefinitions[] = [
    ...LimitedAttenuationWallFlagsDataModel.HOOKS_DEFINITIONS,
    ...RenderWallConfigPatchApp.HOOKS_DEFINITIONS,
  ]
}
