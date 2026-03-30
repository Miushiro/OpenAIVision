import React from 'react';
import './App.css';

const DocumentUpload = React.lazy(() => import('./components/DocumentUpload'));

const App = () => {
	return(
		<DocumentUpload />
	)
};

export default App;