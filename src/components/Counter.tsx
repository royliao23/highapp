import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../state/store'
import { increment, decrement, incrementByAmount } from '../state/counter/counterSlice';
function Counter() {
    const count = useSelector((state:RootState) => state.counter.value);
    const dispatch =useDispatch()
  return (
    <div>
      <h4>How many time do you want to contact me?: {count}</h4>
      <div className="act_div">
        <button className="button_count" onClick={()=>dispatch(increment())}>+1</button>
        <button className="button_count" onClick={()=>dispatch(decrement())}>-1</button>
        <button className="button_count" onClick={()=>dispatch(incrementByAmount(8))}>+8</button>
      </div>
    </div>
  )
}

export default Counter
