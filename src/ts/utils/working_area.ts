/**
 * A function type that evaluates or transforms content based on a rectangle.
 */
export type ContentEvaluator<T> = (rect: PIXI.Rectangle, content: T) => T;

/**
 * Abstract base class representing a working area defined by a rectangle.
 */
export interface WorkingArea<T> {

    /**
     * Checks if the given rectangle is fully contained within this working area.
     * @param rect The rectangle to check.
     */
    contains(rect: PIXI.Rectangle): boolean;

    /**
     * Gets the content associated with this working area.
     */
    getContent(): T;

    /**
     * Gets the hierarchical level of this working area.
     */
    level(): number;
}

/**
 * Represents a sub-area within a parent working area, with content evaluated by a ContentEvaluator.
 */
export class SubWorkingArea<T> implements WorkingArea<T> {
    private content: T | null = null;

    /**
     * Constructs a new SubWorkingArea.
     * @param rect The rectangle defining the sub-area.
     * @param parent The parent working area.
     * @param contentEvaluator The function to evaluate content for this sub-area.
     */
    constructor(
        private readonly rect: PIXI.Rectangle,
        private readonly parent: WorkingArea<T>,
        private readonly contentEvaluator: ContentEvaluator<T>) { }

    /**
     * @inheritdoc
     */
    contains(rect: PIXI.Rectangle): boolean {
        return this.rect.contains(rect.x, rect.y) && this.rect.contains(rect.right - 1, rect.bottom - 1);
    }

    /**
     * @inheritdoc
     */
    getContent(): T {
        if (!this.content) {
            this.content = this.contentEvaluator(this.rect, this.parent.getContent());
        }
        return this.content;
    }


    /**
     * @inheritdoc
     */
    level(): number {
        return this.parent.level() + 1;
    }
}

/**
 * Represents the root working area with a fixed content and infinite bounds.
 */
export class MasterWorkingArea<T> implements WorkingArea<T> {

    /**
     * Constructs a new MasterWorkingArea with infinite bounds.
     * @param content The content for the master area.
     */
    constructor(private readonly content: T) { }


    /**
     * @inheritdoc
     */
    contains(_rect: PIXI.Rectangle): boolean {
        return true;
    }


    /**
     * @inheritdoc
     */
    getContent(): T {
        return this.content;
    }


    /**
     * @inheritdoc
     */
    level(): number {
        return 0;
    }
}
