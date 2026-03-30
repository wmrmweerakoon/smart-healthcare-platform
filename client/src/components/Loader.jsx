import './Loader.css';

const Loader = ({ size = 'md', text = '' }) => {
    return (
        <div className={`loader-container loader-${size}`} id="loader">
            <div className="loader-spinner"></div>
            {text && <p className="loader-text">{text}</p>}
        </div>
    );
};

export default Loader;
