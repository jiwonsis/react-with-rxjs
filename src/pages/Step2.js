import React, {Component} from 'react';
import "./Step2.css";
import {fromEvent} from 'rxjs'
import {takeUntil, switchMap, map, first, mergeAll} from "rxjs/operators"

class CarouselUI extends  Component {
	
	// 터치가 시작되었을 경우, 현재 좌표 X 값 구하기
	// toPos = (event) => {
	// 	const SUPPORT_TOUCH = "ontouchstart" in window;
	// 	return SUPPORT_TOUCH ? event.changedTouches[0].pageX : event.pageX;
	// };
	// [Refactoring ->] Observable 타입으로 변경
	toPos = (obs$) => {
		const SUPPORT_TOUCH = "ontouchstart" in window;
		return obs$.pipe(
			map(v => SUPPORT_TOUCH ? v.changedTouches[0].pageX : v.pageX)
		)
	};
	
	// 터치 또는 마우스 이벤트 핸들러 객체
	touchEvent = () => {
		const SUPPORT_TOUCH = "ontouchstart" in window;
		return {
			start: SUPPORT_TOUCH ? "touchstart" : "mousedown",
			move: SUPPORT_TOUCH ? "touchmove": "mousemove",
			end: SUPPORT_TOUCH ? "touchend": "mouseup",
		}
	};
	
	componentDidMount() {
		// 뷰
		const $view = document.getElementById("carousel");
		
		// 컨테이너
		const $container = document.querySelector(".container");
		
		// 패널 갯수
		const PANNEL_COUNT = $container.querySelectorAll(".panel").length;
		
		// 키보드 또는 터치 이벤트
		const start$ = fromEvent($view, this.touchEvent().start).pipe(this.toPos);
		const move$ = fromEvent($view, this.touchEvent().move).pipe(this.toPos);
		const end$ = fromEvent($view, this.touchEvent().end).pipe(this.toPos);
		
		// 드래그는 start$ 이벤트가 발생 되며, end$ 이벤트가 발생 시킬 경우, 자동으로 완료처리와 구독헤제 처리가 되어야 한다.
		const drag$ = start$.pipe(
			// 기본
			// map(start => move$.pipe(
			// 	takeUntil(end$), // move$ 이벤트가 end$ 가 발생하면, observable 를 구독 중지(complete -> 구독헤제) 시킨다.
			// )),
			// mergeAll(), // 여러 Observable 를 하나로 합치고, flat 으로 만듬
			
			// [Refactor.1] -> 위의 기능을 하나로 합치자.
			// mergeMap(() => move$.pipe(
			// 	takeUntil(end$)
			// ))
			
			// [Refactor.2] -> start$ 에서 데이터가 발생할 때마다 move$ 생성되기 때문에 자동으로 기존 데이터를 종료 시킨다
			switchMap(start => {
				return move$.pipe(
					map(move => move - start), // start$.X 값 - move$.X 값 차이를 구한다.
					takeUntil(end$)
				)
			})
		);
		
		// 드롭은 드래그 이벤트를 전달 받고 end$로 넘길때 사용한다.
		const drop$ = drag$.pipe(
			// map(drag => end$.pipe(first())), // 드롭 이벤트는 딱 한번만 발생해야하기 때문에 take(1) 또는 first 오퍼레이터를 써야함
			// // Best practice
			// // 되도록이면 직접적으로 구독을 해제하지 않는다
			// // 가급적이면 takeUntil, take, first 오퍼레이터를 이용하여 자동으로 구독 해제하도록 한다.
			// mergeAll(), // 펑탄화
			
			//[Refactor] -> switchMap
			switchMap(drag => end$.pipe(first()))
		);
		drag$.subscribe(distance => console.log(`start$.X 값 - move$.X 값 = ${distance}`));
		drop$.subscribe(v => console.log(`드롭 ${v}`));
	}
	
	render() {
		return (
			<div id="carousel" className="view">
				<ul className="container">
					<li className="panel" style={{backgroundColor:"lightgreen"}} />
					<li className="panel" style={{backgroundColor:"lightpink"}} />
					<li className="panel" style={{backgroundColor:"royalblue"}} />
					<li className="panel" style={{backgroundColor:"darkred"}} />
				</ul>
			</div>
		)
	}
}

export default  CarouselUI;