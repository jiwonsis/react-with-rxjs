import React, {Component, Fragment} from 'react';
import {fromEvent} from 'rxjs';
import {
	map,
	mergeMap,
	debounceTime,
	filter,
	distinctUntilChanged,
} from 'rxjs/operators'
import {ajax} from 'rxjs/ajax'
import './Step1.css';

const searchList = (user) => (
	<li className="user" key={user.id}>
		<img src={user.avatar_url} width="50px" height="50px" />
		<p><a href={user.html_url} target="_blank">{user.login}</a></p>
	</li>
);

class AutoCompletedUI extends Component {
	keyUp$ = null;
	
	constructor() {
		super();
		this.state = {items: []}
	}
	
	componentDidMount() {
		const user$ = fromEvent(document.getElementById('search'), 'keyup')
			.pipe(
				debounceTime(300),
				map(event => event.target.value),
				distinctUntilChanged(),
				filter(query => query.trim().length > 0),
				mergeMap(query => ajax.getJSON(`https://api.github.com/search/users?q=${query}`)),
			);
		
		user$.subscribe(data => {
			console.log(data);
			this.setState({items: data.items});
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
				</div>
			</Fragment>
		)
	}
}
export default AutoCompletedUI;