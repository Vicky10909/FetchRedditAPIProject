class App extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      posts: null,
      error: null
    };

    this.handleError = this.handleError.bind(this);
    this.handleSuccess = this.handleSuccess.bind(this);
    this.handleUserSearch = this.handleUserSearch.bind(this);

  }
  // Call API
  componentDidMount() {
    fetch("https://www.reddit.com/.json")
    // First, turn the response into a usable object
    .then((response => response.json()))
    // Next, handle the usable response
    .then(this.handleSuccess, this.handleError);
  }

  handleError(error) {
    console.log('handle error called');
    this.setState({posts: null, error: error});
  }
 
  // Save responseData to posts
  handleSuccess(responseData) {
    console.log('handle success');
    // if we receieve error from responseData, we call handleError function
    if (responseData.error !== undefined) {
      this.handleError(responseData.error);
      return;
    }
    
    const sortedPosts = responseData.data.children.sort((a,b) => b.data.ups - a.data.ups);

    this.setState({
      posts: sortedPosts,
      error: null
    });
  }

  // this function will be called when search button is clicked
  handleUserSearch(searchInput) {
    
    let searchURL = "https://www.reddit.com/r/" + searchInput + "/hot.json";

    // If search bar has no input, it will show orginial reddit posts
    if (searchInput === "") {
      searchURL = "https://www.reddit.com/.json";
    }
    
    // certain data will be fetched bases on searchURL
    fetch(searchURL)
      .then(response => response.json())
      .then(this.handleSuccess, this.handleError);
  }

  render() {
    
        // if there's an error, tell the user to try again
        if (this.state.error !== null) {
          console.log('here is the error');
          return (
            <div>
               <h1>There's an error! Try again!</h1>
               <SearchBar  didCompleteSearch={this.handleUserSearch} />
            </div> 
          );
        }


    // if posts are null we are still waiting
    if (this.state.posts === null) {
      console.log('posts are still loading');
      return (
        <div>
          <h1>Loading...</h1>
          <SearchBar  didCompleteSearch={this.handleUserSearch} />
        </div>
      );
    }


    // if we successfully fetch data, each post will have an unique id 
    // each post will have a title, subredditName, thumbnailImg, hyperLink and upvotes
    // we save each post to returnedPosts
    const returnedPosts = [];
    for (let i = 0; i < this.state.posts.length; i++) {
      const post = this.state.posts[i]; 
      const redditPostLink = "http://reddit.com" + post.data.permalink;


     // push PostDeatil to returnedPosts
      returnedPosts.push(
       <PostDetail
         key={i}
         title={post.data.title}
         subreddit={post.data.subreddit} 
         thumbnailURL={post.data.thumbnail} 
         hyperlink={redditPostLink}
         numberOfUpvotes={post.data.ups}
       />
      );
    }

    let displayTitle = "Top Reddit Posts";

    return (
      <div>
        <h1>{displayTitle}</h1>
        <SearchBar  didCompleteSearch={this.handleUserSearch} />
        {returnedPosts}
      </div> 
    );
  }
}

class PostDetail extends React.Component {
  render() { 
    const imageURL = this.props.thumbnailURL;
    let thumbnail = <div className="img"/>;

    if (isValidImage(imageURL)) {
       thumbnail = <img className="img" src={imageURL} /> ;
    } 
    
    return (
      <div className="postOutline">  
        <a href={this.props.hyperlink}><h2 className="titleStyle">{this.props.title}</h2></a>
        <p className="subtitleStyle">r/{this.props.subreddit}</p>
        {thumbnail}
        <p className="upVotesStyle">This post has {this.props.numberOfUpvotes} ups</p>
      </div>
    );
  }
}

// Child class to handle search bar
class SearchBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {searchText: ""};

    this.handleSearchClick = this.handleSearchClick.bind(this);
    this.onChange = this.onChange.bind(this);
  }
  

  handleSearchClick() {
    // searchText is searchInput 
    this.props.didCompleteSearch(this.state.searchText);
  }
  
  onChange(event) {
    this.setState({searchText: event.target.value});
  }

  render() {
    return (
      <div className="searchFlex">
        <input className="searchInput" value={this.state.searchText} onChange={this.onChange} />
        <button className="searchButton" onClick={this.handleSearchClick}>Search</button>
      </div>
    );
  }
}

// Add an App to the DOM as a child of root
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);


function isValidImage(string) {
  if (string.startsWith("https://external-preview.redd.it")) {
    return false;
  }

  try {
    new URL(string);
  } catch(error) {
    return false;
  }

  return true;
}

