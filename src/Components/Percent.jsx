
    export default function percentChange(oldNumber, newNumber) {

      let decreaseValue = oldNumber - newNumber;

      return (decreaseValue / oldNumber) * 100;

}
   