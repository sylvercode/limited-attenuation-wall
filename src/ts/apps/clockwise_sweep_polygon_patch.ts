import { WorkingAreaCache, ContentEvaluator, WorkingArea } from "../utils/working_area_cache";
import { LimitedAttenuationWallFlagsDataModel } from "./limited_attenuation_wall_flags_data_model";
import type { LibWrapperBaseCallback, LibWrapperBaseCallbackArgs, LibWrapperWrapperDefinitions } from "fvtt-lib-wrapper-types";
import type { Edge } from "fvtt-types/src/foundry/client/canvas/geometry/edges/_module.mjs";
import type { IPointData } from "fvtt-types/src/types/augments/pixi.mjs";

/**
 * LibWrapper patch definitions for ClockwiseSweepPolygon edge identification.
 */
export const LIBWRAPPER_PATCHS: Iterable<LibWrapperWrapperDefinitions> = [
    {
        target: "foundry.canvas.geometry.ClockwiseSweepPolygon.prototype._identifyEdges",
        fn: identifyEdges_Wrapper,
        type: "WRAPPER"
    }
];

/**
 * Wrapper for the _identifyEdges method to inject custom edge identification logic.
 * @param this The ClockwiseSweepPolygon instance
 * @param wrapped The base wrapped function
 * @param args The arguments of the wrapped function
 * @returns The result of the wrapped function
 */
function identifyEdges_Wrapper(this: ClockwiseSweepPolygon, wrapped: LibWrapperBaseCallback, ...args: LibWrapperBaseCallbackArgs): any {
    const result = wrapped.apply(this, args);
    identifyEdges(this);
    return result;
}

/**
 * The two sides of an edge.
 */
type EdgeSides = 'a' | 'b';

/**
 * Array of edge sides for iteration.
 */
const EdgeSides: EdgeSides[] = ['a', 'b'];

/**
 * Information about an edge update, including new point and affected edge points.
 */
type EdgeUpdateInfo = {
    newPoint: IPointData | null,
    edgePoints: {
        edge: Edge,
        side: EdgeSides
    }[],
}

/**
 * Content type for working areas: array of edges and their limited attenuation ratios.
 */
type WorkingAreaContent = { edge: Edge, limitedAttenuationRatio: number | null }[];

/**
 * Identifies and updates edges for a ClockwiseSweepPolygon instance.
 * @param csp The ClockwiseSweepPolygon instance.
 */
function identifyEdges(csp: ClockwiseSweepPolygon): void {
    const updatesInfo = new Map<number, EdgeUpdateInfo>;
    const workingAreaContent = orderLimitedEdgesFarestToClosest(csp.origin, csp.edges, csp.config.type);

    if (workingAreaContent.length === 0)
        return;

    const workingAreaCache = new WorkingAreaCache<WorkingAreaContent>(workingAreaContent, filterWorkingAreaEdges);
    for (const { edge } of workingAreaContent) {
        const workingArea = workingAreaCache.createWorkingArea(csp.origin, edge.a, edge.b);

        EdgeSides.forEach((side) => {
            const point = edge[side];

            const pointKey = foundry.canvas.geometry.edges.PolygonVertex.getKey(point.x, point.y);
            const pointUpdate = updatesInfo.get(pointKey);
            if (pointUpdate) {
                if (pointUpdate.newPoint)
                    pointUpdate.edgePoints.push({ edge, side });
                return;
            }

            const newPoint = calcNewPoint(csp.origin, point, workingArea);
            if (newPoint)
                updatesInfo.set(pointKey, { newPoint, edgePoints: [{ edge, side }] });
            else
                updatesInfo.set(pointKey, { newPoint: null, edgePoints: [] });
        });
    };

    for (const { newPoint, edgePoints } of updatesInfo.values()) {
        if (!newPoint)
            continue;
        for (const { edge, side } of edgePoints) {
            edge[side].x = newPoint.x;
            edge[side].y = newPoint.y;
        }
    }
}

/**
 * Gets the limited attenuation ratio for an edge, if present.
 * @param edge The edge to check.
 * @returns The limited attenuation ratio or null.
 */
function getLimitedAttenuationRatio(edge: Edge): number | null {
    if (!(edge.object?.document instanceof WallDocument))
        return null;

    const dataModel = new LimitedAttenuationWallFlagsDataModel(edge.object.document);
    return dataModel.hasLimitedAttenuation && dataModel.limitedAttenuationRatio !== undefined
        ? dataModel.limitedAttenuationRatio
        : null;
}

/**
 * Gets the restriction type for an edge.
 * @param type The polygon type.
 * @param edge The edge to check.
 * @returns The wall sense type restriction.
 */
function getEdgeRestriction(type: PointSourcePolygon.PolygonType, edge: Edge): CONST.WALL_SENSE_TYPES {
    const restriction = (edge as any)[type];
    if (typeof restriction === undefined) {
        return CONST.WALL_SENSE_TYPES.NONE;
    }
    return restriction;
}

/**
 * Filters edges in a working area based on intersection and limited attenuation.
 * @param rect The rectangle to test against.
 * @param parentContent The parent working area's content.
 * @returns Filtered working area content.
 */
function filterWorkingAreaEdges(rect: PIXI.Rectangle, parentContent: WorkingAreaContent): WorkingAreaContent {
    let hasLimitedAttenuationWalls = true;
    const filteredEdges = parentContent.filter((element) => {
        if (!hasLimitedAttenuationWalls) {
            hasLimitedAttenuationWalls = element.limitedAttenuationRatio !== null;
        }
        return rect.lineSegmentIntersects(element.edge.a, element.edge.b, { inside: true });
    });

    if (!hasLimitedAttenuationWalls)
        return [];

    return filteredEdges;
}

/**
 * Calculates the squared distance between two points.
 * @param pt1 First point.
 * @param pt2 Second point.
 * @returns Squared distance.
 */
function calcSquaredDistance(pt1: Canvas.Point, pt2: Canvas.Point): number {
    return (pt1.x - pt2.x) ** 2 + (pt1.y - pt2.y) ** 2;
}

/**
 * Orders limited edges from farthest to closest to the origin. 
 * Also checks for limited attenuation walls presence. If none are found, returns an empty array.
 * @param origin The origin point.
 * @param edges The set of edges.
 * @param type The polygon type.
 * @returns Ordered working area content. Or empty array if no limited attenuation walls are present.
 */
function orderLimitedEdgesFarestToClosest(origin: Canvas.Point, edges: Set<Edge>, type: PointSourcePolygon.PolygonType): WorkingAreaContent {
    let hasLimitedAttenuationWalls = false;
    const workingAreaContent = Array.from(edges.filter(edge => {
        const isLimited = getEdgeRestriction(type, edge) === CONST.WALL_SENSE_TYPES.LIMITED;

        if (isLimited && !hasLimitedAttenuationWalls) {
            hasLimitedAttenuationWalls = getLimitedAttenuationRatio(edge) !== null;
        }

        return isLimited;
    })).map(edge => {
        const limitedAttenuationRatio = getLimitedAttenuationRatio(edge);
        hasLimitedAttenuationWalls = hasLimitedAttenuationWalls || (limitedAttenuationRatio !== null);
        return { edge, limitedAttenuationRatio };
    })

    if (!hasLimitedAttenuationWalls)
        return [];

    const workingAreaContentWithSquaredDistances = workingAreaContent.map(wac => {
        const dA = calcSquaredDistance(wac.edge.a, origin);
        const dB = calcSquaredDistance(wac.edge.b, origin);
        const distances = (dA > dB) ? { big: dA, small: dB } : { big: dB, small: dA };
        return { ...wac, distances };
    });

    if (!hasLimitedAttenuationWalls)
        return [];

    return workingAreaContentWithSquaredDistances.sort((a, b) => {
        const bigDiff = b.distances.big - a.distances.big;
        if (bigDiff)
            return bigDiff;
        return b.distances.small - a.distances.small;
    });
}

/**
 * Calculates a new point for an edge based on limited attenuation intersections.
 * @param origin The origin point.
 * @param point The point to project from.
 * @param workingArea The working area containing edges.
 * @returns The new projected point or null.
 */
function calcNewPoint(origin: Canvas.Point, point: Canvas.Point, workingArea: WorkingArea<WorkingAreaContent>): IPointData | null {
    const XRay = new foundry.canvas.geometry.Ray(origin, point);
    const edgeOnPath = [];
    for (const { edge, limitedAttenuationRatio } of workingArea.getContent()) {

        if (EdgeSides.some((side) => {
            return edge[side].x === point.x && edge[side].y === point.y;
        }))
            continue;

        const intersection = XRay.intersectSegment([edge.a.x, edge.a.y, edge.b.x, edge.b.y]);
        if (!intersection)
            continue;

        edgeOnPath.push({
            edge,
            limitedAttenuationRatio,
            intersection
        });
    }

    if (edgeOnPath.length === 0)
        return null;

    const firstEdge = edgeOnPath.reduce((max, curr) => {
        return (curr.intersection.t0 > max.intersection.t0) ? curr : max;
    }, edgeOnPath[0]);

    if (firstEdge.limitedAttenuationRatio === null)
        return null;

    const XRay2 = new foundry.canvas.geometry.Ray(point, firstEdge.intersection);
    return XRay2.project(firstEdge.limitedAttenuationRatio);
}
