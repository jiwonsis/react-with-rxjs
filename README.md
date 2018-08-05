## Rxjs를 이용한 리액트 콤포넌트 실험실

### 1-1. 자동완성 UI part.1
- 책에서는 html로 작업하였기 때문에 document.innerHTML로 하였지만, 리액트에서는 state의 값으로 전달해서 작업하였다
- Observable의 경우, viewDidMount쪽에 생성하여, 구독하는 형태로 쓰였으나, 차후 ref로 넘기는 방식도 고민해볼만 하다.
- 키보드 이벤트로 다루었기때문에, 화살표 키보드라던지, 시프트 이벤트 처리는 distictUntilChanged로 내부의 값이 변경이 안되는 이벤트의 경우 걸러주게 하였다.
- 서버의 이벤트가 한글자씩 칠때마다, 전달하는 방법은 옳지 못한 예라고 생각되어 debounce(300)을 주어서 해당 타임라인 끝에 처리하는 방식으로 하였다.
- rxJs의 filter는 es6의 필터와 동일한 역할을 한다.
- ajax로 받아온 데이터를 변경하기위해서 map > mapAll > mergeMap으로 요청받은 데이터를 가공하여 처리할수도 있다.


### 1-2. 자동완성 UI part.2
- 하나의 Observable에서 두개의 Observable로 분리를 partition이라는 것으로 하였음. partition이라는 Rx함수는 필터의 해당되는것과 아닌것 (if,else만 있는 삼항식)으로 분리하여 observable을 분리한다.
- 두개의 Observable로 분리되면서 한쪽에서만 구독 데이터가 오는 부분을 양쪽 각각 구독 형태로 각각의 부분에서 데이터 처리하는 부분이 생겼음.
- 로딩부분이 추가되면서, tap이라는 오퍼레이터로 중간중간 내부 함수를 실행시켜주면서 시퀀스를 이어나갔음.

### 1-3. 자동완성 UI part.3
- 자동완성에서 이미 요청한 데이터가 처리하기 전에 다른 데이터 요청이 들어올 경우 어떻게 처리할까? 전에는 flatMapLatest(마지막 데이터만 유효한 데이터처리)를 사용했지만, [map() -> switchAll()] 또는 이 처리를 합친 switchMap으로 처리하였다.
해당 처리로 기존의 요청하고 있는 도중에 다른 요청이 들어올 경우, 기존 데이터 요청을 취소하고 해당 obseravable를 unsubscribe(구독 취소)를 하여, 메모리 누수 현상도 없어진다.
- 서버에서 에러를 줄경우의 처리는 두군데서 할 수있다. 1번째는 subscribe 쪽에서 error 파라미터에서 처리하는 방식, 그리고 또하나는 obervable 에서 catchError로 처리하는 방식이 있다.

### 1-4 자동완성 UI part.4
- subject 를 사용하여 데이터가 두번 발생하는 문제를 해결함.
- partition 처리 구간을 subject 로 만들고, 마지막에 keyUp$에서 subject 를 구독하는 방식으로 연결하였음.
- 하지만 RxJs의 Best Practice 를 위반 하고 있다. Subject 는 Observable 과 다르게 데이터를 변경할 수 있기때문에 가급적이면 Subject를 구현의
내부로 감추어서 사이드 이펙트를 최소화하는 방향으로 사용해야한다고 한다.

### 1-5 자동완성 UI part.5



#### 참고
- Hot Observable 과 Cold Observable 의 차이점
- Cold Observable : 함수 내부의 클래스또는 변수를 지정하여 독립적인 영역을 갖게 되며, 함수와 같이 lazy 하게
동작할 수 있다. 오직 하나의 Observable 에게만 동일한 데이터를 전달할 수 있다는 말이다
- Hot Observable : 내부에 클래스나 변수를 만들어 놓은 것은 내부에서 처리하도록 구현하는 방법이다. Hot Observable 은
만들 때마다 독립적으로 동작하기 않은 기존 클래스를 공유하기 때문에 구독 시점과 상관없이 데이터를 중간부터 전달하게 된다.
- fromEvent 에 의해 생성된 Observable 은 Hot Observable 이다. 데이터를 전달하는 주체가 외부에서 만들어진 DOM 이기 때문이다.

|구분               | Cold Observable  | Hot Observable |
|----------------- | ------------- | -------------            |
| 데이터 주체 생성 시기 | Observer 내부 | Observer 외부              |
| Observer 와의 관계 | 1:1          | 1:N (다수)                  |
| 데이터 영역         | Observer 마다 독립적              | N개의 Observer 와 공유 |
| 데이터 전달 시점     | 구독하는 순간부터 데이터를 전달하기 시작    | 구독과 상관없이 데이터를 중간부터 전달 |
| RxJs 객체         | Observable |  fromEvent 에 의해 생성된 Observable, ConnectableObservable, Subject | 