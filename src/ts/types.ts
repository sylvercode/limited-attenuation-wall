import type { LibWrapperWrapperDefinitions } from "fvtt-lib-wrapper-types";
import { HookDefinitions } from "fvtt-hook-attacher";
import * as ClockwiseSweepPolygonPatch from "./apps/clockwise_sweep_polygon_patch";
import * as RenderWallConfigPatchApp from "./apps/render_wall_config_patch";
import * as LimitedAttenuationWallFlagsDataModel from "./apps/limited_attenuation_wall_flags_data_model";
import * as LimitedAttenuationWallSettings from "./apps/limited_attenuation_wall_settings";


/**
 * Interface for the Limited Attenuation Wall module, extending Foundry's Module interface.
 */
export interface LimitedAttenuationWallModule
  extends foundry.packages.Module {

}

/**
 * Callback type for module initialization.
 */
export type OnInitModuleFunc = (module: LimitedAttenuationWallModule) => void;

/**
 * Contains static properties for module hooks, libWrapper patches, and hook definitions.
 */
export class LimitedAttenuationWallModuleHooks {
  /**
   * Iterable of callbacks to be called on module initialization.
   */
  static ON_INIT_MODULE_CALLBACKS: Iterable<OnInitModuleFunc> = [
    LimitedAttenuationWallSettings.onInitHandle
  ];

  /**
   * Iterable of libWrapper patch definitions to be registered.
   */
  static LIBWRAPPER_PATCHS: Iterable<LibWrapperWrapperDefinitions> = [
    ...ClockwiseSweepPolygonPatch.LIBWRAPPER_PATCHS,
  ];

  /**
   * Set of hook definitions to be attached.
   */
  static HOOKS_DEFINITIONS_SET: HookDefinitions[] = [
    ...LimitedAttenuationWallFlagsDataModel.HOOKS_DEFINITIONS,
    ...RenderWallConfigPatchApp.HOOKS_DEFINITIONS,
  ]
}
