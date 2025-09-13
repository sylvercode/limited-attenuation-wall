/**
 * A function type that evaluates or transforms content based on a rectangle.
 */
export type ContentEvaluator<T> = (rect: PIXI.Rectangle, content: T) => T;

/**
 * Abstract base class representing a working area defined by a rectangle.
 */
export abstract class WorkingArea<T> {

    /**
     * Constructs a new WorkingArea.
     * @param rect The rectangle defining the working area.
     */
    protected constructor(protected readonly rect: PIXI.Rectangle) { }

    /**
     * Checks if the given rectangle is fully contained within this working area.
     * @param rect The rectangle to check.
     */
    contains(rect: PIXI.Rectangle): boolean {
        return this.rect.contains(rect.x, rect.y) && this.rect.contains(rect.right - 1, rect.bottom - 1);
    }

    /**
     * Gets the content associated with this working area.
     */
    abstract getContent(): T;

    /**
     * Gets the hierarchical level of this working area.
     */
    abstract level(): number;
}

/**
 * Represents a sub-area within a parent working area, with content evaluated by a ContentEvaluator.
 */
export class SubWorkingArea<T> extends WorkingArea<T> {
    private content: T | null = null;

    /**
     * Constructs a new SubWorkingArea.
     * @param rect The rectangle defining the sub-area.
     * @param parent The parent working area.
     * @param contentEvaluator The function to evaluate content for this sub-area.
     */
    constructor(rect: PIXI.Rectangle,
        private readonly parent: WorkingArea<T>,
        private readonly contentEvaluator: ContentEvaluator<T>) {
        super(rect);
    }

    /**
     * Gets the content for this sub-area, evaluating it if not already cached.
     */
    override getContent(): T {
        if (!this.content) {
            this.content = this.contentEvaluator(this.rect, this.parent.getContent());
        }
        return this.content;
    }

    /**
     * Gets the hierarchical level of this sub-area (parent level + 1).
     */
    override level(): number {
        return this.parent.level() + 1;
    }
}

/**
 * Represents the root working area with a fixed content and infinite bounds.
 */
export class MasterWorkingArea<T> extends WorkingArea<T> {

    /**
     * Constructs a new MasterWorkingArea with infinite bounds.
     * @param content The content for the master area.
     */
    constructor(private readonly content: T) {
        super(new PIXI.Rectangle(-Infinity, -Infinity, Infinity, Infinity));
    }

    /**
     * Gets the content for the master area.
     */
    override getContent(): T {
        return this.content;
    }

    /**
     * Gets the hierarchical level of the master area (always 0).
     */
    override level(): number {
        return 0;
    }
}
