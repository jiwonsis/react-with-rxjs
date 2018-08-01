import React, {Component, Fragment} from 'react';
import {fromEvent} from 'rxjs';
import {
	map,
	mergeMap,
	debounceTime,
	filter,
	distinctUntilChanged,
	tap,
	partition,
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
	$loading = null;
	
	constructor() {
		super();
		this.state = {
			items: [],
			loading: false,
		}
	}
	
	componentDidMount() {
		this.$loading = document.getElementById('loading');
		const keyUp$ = fromEvent(document.getElementById('search'), 'keyup')
			.pipe(
				debounceTime(300),
				map(event => event.target.value),
				distinctUntilChanged(),
			);
		
		let [user$, reset$] = keyUp$
			.pipe(
				partition(query => query.trim().length > 0)
			);
		
		user$ = keyUp$
			.pipe(
				tap(_ => this.showLoading()),
				mergeMap(query => ajax.getJSON(`https://api.github.com/search/users?q=${query}`)),
				tap(_ => this.hideLoading()),
			);
		
		reset$ = keyUp$
			.pipe(
				tap(() => this.resetState()),
			).subscribe();
		
		user$.subscribe(data => {
			this.setState({
				...this.state,
				items: data.items
			});
		});
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