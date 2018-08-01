import React, {Fragment} from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {
	BrowserRouter,
	Route
} from 'react-router-dom';
import App from './App';

ReactDOM.render(
	<Fragment>
		<BrowserRouter>
			<Route path="/" component={App}/>
		</BrowserRouter>
	</Fragment>
	, document.getElementById('root'));
