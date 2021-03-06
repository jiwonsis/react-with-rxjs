## Rxjs를 이용한 리액트 콤포넌트 실험실

### 1-1. 자동완성 UI part.1
- 책에서는 html 로 작업하였기 때문에 document.innerHTML 로 하였지만, 리액트에서는 state 의 값으로 전달해서 작업하였다
- Observable 의 경우, viewDidMount 쪽에 생성하여, 구독하는 형태로 쓰였으나, 차후 ref 로 넘기는 방식도 고민해볼만 하다.
- 키보드 이벤트로 다루었기때문에, 화살표 키보드라던지, 시프트 이벤트 처리는 distinctUntilChanged 함수로 내부의 값이 변경이 안되는 이벤트의 경우 걸러주게 하였다.
- 서버의 이벤트가 한글자씩 칠때마다, 전달하는 방법은 옳지 못한 예라고 생각되어 debounce(300)을 주어서 해당 타임라인 끝에 처리하는 방식으로 하였다.
- rxJs의 filter 는 es6의 필터와 동일한 역할을 한다.
- ajax 로 받아온 데이터를 변경하기위해서 map > mapAll > mergeMap 으로 요청받은 데이터를 가공하여 처리할수도 있다.


### 1-2. 자동완성 UI part.2
- 하나의 Observable 에서 두개의 Observable 로 분리를 partition 이라는 것으로 하였다.
- partition 이라는 Rx 함수는 조건의 참과 거짓으로 성립된 2개의 Observable 로 나누는 역할을 하는 함수이다.
- 파티션으로 나뉜 두개의 Observable 의 시퀀스 함수를 추가하고 각각 구독형태로 하여 처리하였다.
- 로딩부분이 추가되면서, tap 이라는 오퍼레이터로 중간중간 내부 함수를 실행시켜주면서 시퀀스를 이어나갔음.

### 1-3. 자동완성 UI part.3
- 자동완성에서 이미 요청한 데이터가 처리하기 전에 다른 데이터 요청이 들어올 경우 어떻게 처리할까? 전에는 flatMapLatest(마지막 데이터만 유효한 데이터처리)를 사용했지만, [map() -> switchAll()] 또는 이 처리를 합친 switchMap으로 처리하였다.
해당 처리로 기존의 요청하고 있는 도중에 다른 요청이 들어올 경우, 기존 데이터 요청을 취소하고 해당 observable 를 unsubscribe(구독 취소)를 하여, 메모리 누수 현상도 없어진다.
- 서버에서 에러를 줄경우의 처리는 두군데서 할 수있다. 1번째는 subscribe 쪽에서 error 파라미터에서 처리하는 방식, 그리고 또하나는 observable 에서 catchError 로 처리하는 방식이 있다.

### 1-4 자동완성 UI part.4
- subject 를 사용하여 데이터가 두번 발생하는 문제를 해결함.
- partition 처리 구간을 subject 로 만들고, 마지막에 keyUp$에서 subject 를 구독하는 방식으로 연결하였음.
- 하지만 RxJs의 Best Practice 를 위반 하고 있다. Subject 는 Observable 과 다르게 데이터를 변경할 수 있기때문에 가급적이면 Subject 를 구현의
내부로 감추어서 사이드 이펙트를 최소화하는 방향으로 사용해야한다고 한다.
- RxJs 에서는 이를 보다 효율적으로 제어하기 위해 ConnectableObservable 를 사용하라고 권고 하고 있다. 

### 1-5 자동완성 UI part.5
- ConnectableObservable 은 Hot Observable 의 한 종류이기 때문에, 데이터롤 공유할 뿐만 아니라, 데이터 전달 시점을 connect 라는 함수로 제어할 수 있다. connect 가
호출되는 순간부터 구독된 대상으로 데이터를 전달한다.
- ConnectableObservable 은 Observable 의 multicast 오퍼레이터로 생성할 수 있다.
- 하지만, multicast 에 메반 subject 를 생성해야되는 번거로움을 해결하기 위해서, publish 라는 함수를 사용하면 더욱 간결하게 처리할 수 있다.
- ConnectableObservable 를 사용하게 되면 구독 대상의 존재 여부에 따라 connect 와 unsubscribe 를 사용하여 데이터를 전송하고 중지하는 작업을 꼭 해야한다. 이 또한 사실 불편한 작업이다.
- 또한, 매번 connect 를 쓰는것 또한, 가독성에서 그리좋은 모습이 아니였다. 따라서 해당 부분 connect 대신, refCount 함수를 사용하여 자동으로 구독과 구독 취소를 관리하도록 하였다. 


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