import React, {Component, Fragment} from 'react';
import {fromEvent} from 'rxjs';
import {
	map,
	switchMap,
	debounceTime,
	distinctUntilChanged,
	finalize,
	tap,
	retry,
	refCount,
	partition,
	publish,
} from 'rxjs/operators'
import {ajax} from 'rxjs/ajax'
import './Step1.css';

const searchList = (user = {avatar_url: '', html_url: '', login: ''}) => (
	<li className="user" key={user.id}>
		<img src={user.avatar_url} width="50px" height="50px" alt="프로필"/>
		<p><a href={user.html_url} target="_blank">{user.login}</a></p>
	</li>
);

class AutoCompletedUI extends Component {
	
	constructor() {
		super();
		this.state = {
			items: [],
			loading: false,
		}
	}
	
	componentDidMount() {
		const keyUp$ = fromEvent(document.getElementById('search'), 'keyup').pipe(
			debounceTime(300),  // 300ms 뒤에 데이터 전달
			map(event => event.target.value),  // 키 이벤트 중에, target.value 만 이벤트 값만 데이터 전달
			distinctUntilChanged(),     // 특수키가 입력된 경우 이벤트 호출 방지 (value 값이 동일한 경우는 데이터 전달 중지)
			tap(v => console.log('from keyup$', v)),
			publish(),
			refCount(),
		);
		
		let [user$, reset$] = keyUp$.pipe(
			partition(query => query.trim().length > 0)  // 파티션 함수의 참이 되는 Observable 은 user$, 거짓인경우, reset$ 으로 두개의 Observable 로 분리
		);
		
		user$.pipe(
			tap(() => this.showLoading()),  // rxjs5 에서는 do라는 함수를 써서 해당 이벤트를 발생시켰으나, 현재는 tap 으로 처리
			switchMap(query => ajax.getJSON(`https://api.github.com/search/users?q=${query}`)), // 기존 처리가 완료 안된 상태에서 새로운 처리가 들어온 경우 기존 데이터는 unsubscribe 처리하고 새로운 데이터를 처리함
			tap(() => this.hideLoading()),
			retry(2), // throw error 가 발생했을 경우, 2번까지는 제시도 가능
			finalize(() => this.hideLoading()),     // try-catch 의 finally 와 동일한 이벤트 발생
			tap(v => console.log('from user$', v)),
		).subscribe({
			next: (data) => {       // 구독된 데이터가 정상일 경우의 처리
				this.setState({
					...this.state,
					items: data.items
				});
			},
			error: (error) => {     // 구독된 데이터에서 에러가 발생했을 경우, 해당 이벤트 발생
				console.error(error);
				alert(error.message);
			},
		});
		
		reset$.pipe(
			tap(() => this.resetState()),
			tap(v => console.log('from reset$', v)),
		).subscribe();
	}
	
	resetState() {
		this.setState({
			items: [],
			loading: false,
		})
	}
	
	showLoading() {
		this.setState({
			...this.state,
			loading: true,
		});
	}
	
	hideLoading() {
		this.setState({
			...this.state,
			loading: false,
		});
	}
	
	render() {
		return (
			<Fragment>
				<p>사용자 검색</p>
				<div className="auto-complete">
					<input
						id="search"
						type="input"
						placeholder="검색하고 싶은 사용자 아이디를 입력해주세요"
					/>
					<ul id="suggestLayer">
						{
							this.state.items && (
								this.state.items.map(user => searchList(user))
							)
						}
					</ul>
					{
						this.state.loading && (
							<div id="loading" >
								<i className="fas fa-spinner fa-pulse"/>
							</div>
						)
					}
				</div>
			</Fragment>
		)
	}
}
export default AutoCompletedUI;