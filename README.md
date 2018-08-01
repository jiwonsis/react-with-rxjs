## Rxjs를 이용한 리액트 콤포넌트 실험실

### 1-1. 자동완성 UI part.1
- 책에서는 html로 작업하였기 때문에 document.innerHTML로 하였지만, 리액트에서는 state의 값으로 전달해서 작업하였다
- Observable의 경우, viewDidMount쪽에 생성하여, 구독하는 형태로 쓰였으나, 차후 ref로 넘기는 방식도 고민해볼만 하다.
- 키보드 이벤트로 다루었기때문에, 화살표 키보드라던지, 시프트 이벤트 처리는 distictUntilChanged로 내부의 값이 변경이 안되는 이벤트의 경우 걸러주게 하였다.
- 서버의 이벤트가 한글자씩 칠때마다, 전달하는 방법은 옳지 못한 예라고 생각되어 debounce(300)을 주어서 해당 타임라인 끝에 처리하는 방식으로 하였다.
- rxJs의 filter는 es6의 필터와 동일한 역할을 한다.
- ajax로 받아온 데이터를 변경하기위해서 map > mapAll > mergeMap으로 요청받은 데이터를 가공하여 처리할수도 있다.


### 1-2. 자동완성 UI part.2
- 하나의 Observable에서 두개의 Observable로 분리를 partition이라는 것으로 하였음.
- 두개의 Observable로 분리되면서 한쪽에서만 구독 데이터가 오는 부분을 양쪽 각각 구독 형태로 각각의 부분에서 데이터 처리하는 부분이 생겼음.
- 로딩부분이 추가되면서, tap이라는 오퍼레이터로 중간중간 내부 함수를 실행시켜주면서 시퀀스를 이어나갔음.