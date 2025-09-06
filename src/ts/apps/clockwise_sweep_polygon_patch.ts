import type { LibWrapperBaseCallback, LibWrapperBaseCallbackArgs, LibWrapperWrapperDefinitions } from "fvtt-lib-wrapper-types";
import { LimitedAttenuationWallFlagsDataModel } from "./limited_attenuation_wall_flags_data_model";
import { Edge } from "fvtt-types/src/foundry/client/canvas/geometry/edges/_module.mjs";

type A_B = 'a' | 'b';

const A_B: A_B[] = ['a', 'b'];

type EdgeUpdateInfo = {
    edge: Edge,
    point: A_B,
    newCoord: { x: number, y: number }
}


export default class ClockwiseSweepPolygonPatch {

    static readonly LIBWRAPPER_PATCHS: LibWrapperWrapperDefinitions[] = [
        {
            target: "foundry.canvas.geometry.ClockwiseSweepPolygon.prototype._identifyEdges",
            fn: ClockwiseSweepPolygonPatch.identifyEdges_Wrapper,
            type: "WRAPPER"
        }
    ];

    /**
     * 
     * @param this The ClockwiseSweepPolygon instance
     * @param wrapped The base wrapped function
     * @param args The arguments of the wrapped function
     * @returns the result of the wrapped function
     */
    static identifyEdges_Wrapper(this: ClockwiseSweepPolygon, wrapped: LibWrapperBaseCallback, ...args: LibWrapperBaseCallbackArgs): any {
        const result = wrapped.apply(this, args);
        ClockwiseSweepPolygonPatch._identifyEdges.call(this);
        return result;
    }


    static _identifyEdges(this: ClockwiseSweepPolygon): void {
        const edgesUpdates: EdgeUpdateInfo[] = [];
        for (const edge of this.edges) {
            if (edge.sight !== CONST.WALL_SENSE_TYPES.LIMITED)
                continue;

            function compute(csp: ClockwiseSweepPolygon, point: A_B): EdgeUpdateInfo | null {
                const testPoint = edge[point];
                const XRay = new foundry.canvas.geometry.Ray({ x: csp.origin.x, y: csp.origin.y }, { x: testPoint.x, y: testPoint.y });
                const edgeOnPath = [];
                for (const otherEdge of csp.edges) {
                    if (otherEdge === edge)
                        continue;
                    if (otherEdge.a.x === testPoint.x && otherEdge.a.y === testPoint.y)
                        continue;
                    if (otherEdge.b.x === testPoint.x && otherEdge.b.y === testPoint.y)
                        continue;
                    const intersection = XRay.intersectSegment([otherEdge.a.x, otherEdge.a.y, otherEdge.b.x, otherEdge.b.y]);
                    if (!intersection) continue;
                    edgeOnPath.push({
                        edge: otherEdge,
                        intersection: intersection
                    });
                }

                if (edgeOnPath.length === 0)
                    return null;
                const firstEdge = edgeOnPath.reduce((max, curr) => {
                    return (curr.intersection.t0 > max.intersection.t0) ? curr : max;
                }, edgeOnPath[0]);

                if (firstEdge.edge.sight !== CONST.WALL_SENSE_TYPES.LIMITED)
                    return null;

                if (!(firstEdge.edge.object?.document instanceof WallDocument))
                    return null;
                const dataModel = new LimitedAttenuationWallFlagsDataModel(firstEdge.edge.object.document);
                if (!dataModel.hasLimitedAttenuation || !dataModel.limitedAttenuationRatio)
                    return null;
                const attenuationRatio = dataModel.limitedAttenuationRatio;

                const XRay2 = new foundry.canvas.geometry.Ray(testPoint, firstEdge.intersection);
                const midPoint = XRay2.project(attenuationRatio);
                return {
                    edge,
                    point,
                    newCoord: { x: midPoint.x, y: midPoint.y }
                }
            }

            A_B.forEach((char) => {
                const update = compute(this, char);
                if (update)
                    edgesUpdates.push(update);
            });
        }

        for (const { edge, point, newCoord } of edgesUpdates) {
            if (point === 'a') {
                edge.a.x = newCoord.x;
                edge.a.y = newCoord.y;
            } else if (point === 'b') {
                edge.b.x = newCoord.x;
                edge.b.y = newCoord.y;
            }
        }
    }
}
