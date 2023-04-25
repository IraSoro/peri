class Cycle {
    cycle_len: number = 0;
    period_len: number = 0;
    start_date: string = "";

    constructor() {
        this.cycle_len = 0;
        this.period_len = 0;
        this.start_date = "";
    }

    // isEmpty(): boolean {
    //     if (!this.cycle_len || !this.period_len || !this.start_date) {
    //         return true;
    //     }
    //     return false;
    // }
}

export { Cycle };

