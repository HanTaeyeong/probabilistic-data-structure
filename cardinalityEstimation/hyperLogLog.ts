import { v4 as uuidv4 } from "uuid";

//https://engineering.fb.com/2018/12/13/data-infrastructure/hyperloglog/
//https://towardsdatascience.com/hyperloglog-a-simple-but-powerful-algorithm-for-data-scientists-aed50fe47869

//Error rate loglog 1.3/√m, superloglog 1.05/√m, hyperloglog 1.04/√m

class HyperLogLog {
  private NUM_OF_BUCKETS = 2048;
  private BIAS = 0.79402;
  private BIT_LIMIT = Math.pow(2, 31);
  private buckets: Uint8Array;

  constructor() {
    this.buckets = new Uint8Array(this.NUM_OF_BUCKETS);
  }

  //http://www.isthe.com/chongo/tech/comp/fnv/#:~:text=The%20only%20difference%20between%20the,the%20same%20n%2Dbit%20size.
  private hash(value: string): number {
    //for 32 bits
    var fnvPrime = 16777619;
    var fnvOffset = 2166136261;
    var bits = fnvOffset;

    for (var i = 0; i < value.length; i++) {
      bits ^= value.charCodeAt(i);
      bits *= fnvPrime;
      bits %= this.BIT_LIMIT;
    }

    if (bits < 0) {
      return -bits;
    }
    return bits;
  }

  private calculateLeadingZeros(bits: number): number {
    let order = this.BIT_LIMIT;
    let leadingZeros = 0;

    while (order) {
      if (bits & order) {
        break;
      }
      leadingZeros++;
      order >>= 1;
    }
    return leadingZeros;
  }

  private calcBucketIndex(bits: number): number {
    let index = 0;
    while (bits) {
      index = (index * 31 + bits) % this.NUM_OF_BUCKETS;
      bits >>= 1;
    }
    return index;
  }

  add(value: string) {
    const bits = this.hash(value);

    const bucketIndex = this.calcBucketIndex(bits);

    const leadingZeros = this.calculateLeadingZeros(bits);

    this.buckets[bucketIndex] = Math.max(this.buckets[bucketIndex], leadingZeros);
  }

  getCount(): number {
    let harmonicSum = 0;
    let sum = 0;

    for (let i = 0; i < this.NUM_OF_BUCKETS; i++) {
      harmonicSum += Math.pow(2, -this.buckets[i]);
      sum += this.buckets[i];
    }

    const harmonicMean = this.NUM_OF_BUCKETS / harmonicSum;

    const result = this.NUM_OF_BUCKETS * this.BIAS * harmonicMean;

    //const result2 = this.BIAS * this.NUM_OF_BUCKETS * Math.pow(2, sum / this.NUM_OF_BUCKETS);

    return Math.round(result);
  }
}

const testFunc = () => {
  const TestCountNumber = 10e6;

  const hll = new HyperLogLog();

  for (let i = 0; i < TestCountNumber; i++) {
    hll.add(uuidv4());
  }

  console.log("Real Data Count: ", TestCountNumber);
  console.log("Estimated Count:", hll.getCount());
  const errorRate = Math.abs((TestCountNumber - hll.getCount()) / TestCountNumber) * 100;
  console.log("Error Rate: ", errorRate.toFixed(2) + "%");

  // console.log(1.04 / Math.sqrt(2048));
};

testFunc();
