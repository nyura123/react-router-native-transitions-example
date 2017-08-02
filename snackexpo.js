import React, { Component } from 'react';
import { Text, View, StyleSheet, Animated } from 'react-native';
import { NativeRouter, Route, Link, Switch } from "react-router-native";

const Home = () =>
  <Text style={styles.header}>
    Home
  </Text>;

const About = () =>
  <Text style={styles.header}>
    About
  </Text>;

const Topic = ({ match }) =>
  <Text style={styles.topic}>
    {match.params.topicId}
  </Text>;

const Topics = ({ match }) =>
  <View>
    <Text style={styles.header}>Topics</Text>
    <View>
      <Link
        to={`${match.url}/rendering`}
        style={styles.subNavItem}
        underlayColor="#f0f4f7"
      >
        <Text>Rendering with React</Text>
      </Link>
      <Link
        to={`${match.url}/components`}
        style={styles.subNavItem}
        underlayColor="#f0f4f7"
      >
        <Text>Components</Text>
      </Link>
      <Link
        to={`${match.url}/props-v-state`}
        style={styles.subNavItem}
        underlayColor="#f0f4f7"
      >
        <Text>Props v. State</Text>
      </Link>
    </View>

    <Route path={`${match.url}/:topicId`} component={Topic} />
    <Route
      exact
      path={match.url}
      render={() => <Text style={styles.topic}>Please select a topic.</Text>}
    />
  </View>;

class App extends Component {
  render() {
    return (
  <NativeRouter>
    <View style={styles.container}>
      <View style={styles.nav}>
        <Link to="/" underlayColor="#f0f4f7" style={styles.navItem}>
          <Text>Home</Text>
        </Link>
        <Link to="/about" underlayColor="#f0f4f7" style={styles.navItem}>
          <Text>About</Text>
        </Link>
        <Link to="/topics" underlayColor="#f0f4f7" style={styles.navItem}>
          <Text>Topics</Text>
        </Link>
      </View>

      <Route render={({ location }) => <Pages location={location} />} />
    </View>
  </NativeRouter>
  )
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    padding: 10,
    flex: 1
  },
  header: {
    fontSize: 20
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-around"
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    padding: 10
  },
  subNavItem: {
    padding: 5
  },
  topic: {
    textAlign: "center",
    fontSize: 15
  }
});

export default App;

//ANIMATION


class AnimatedViewSlideOutLeft extends React.Component {
  constructor(props) {
    super(props);
    this.translate = new Animated.Value(0);
  }
  componentDidMount() {
    Animated.timing(this.translate, {
      toValue: -500,
      duration: 400,
      useNativeDriver: true
    }).start(() => this.props.onAnimationEnd && this.props.onAnimationEnd());
  }
  render() {
    return (
      <Animated.View
        style={[
          { transform: [{ translateX: this.translate }] },
          styles2.absoluteContainer
        ]}
      >
        {this.props.children}
      </Animated.View>
    );
  }
}

class AnimatedViewSlideInRight extends React.Component {
  constructor(props) {
    super(props);
    this.translate = new Animated.Value(500);
  }
  componentDidMount() {
    console.log("animating in");
    Animated.timing(this.translate, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true
    }).start(() => this.props.onAnimationEnd && this.props.onAnimationEnd());
  }
  render() {
    return (
      <Animated.View
        style={[
          { transform: [{ translateX: this.translate }] },
          styles2.absoluteContainer
        ]}
      >
        {this.props.children}
      </Animated.View>
    );
  }
}

function animatedPageKey(pathname) {
  //Don't want each new /topics/:topicId path to animate in
  if (pathname.slice(0, 7) == "/topics") return "/topics";
  return pathname;
}

const Pages = ({ location }) =>
  <Transitioner
    childKey={animatedPageKey(location.pathname)}
  >
    <Switch location={location}>
      <Route exact path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/topics" component={Topics} />
      <Route component={Home} />
    </Switch>
  </Transitioner>;

class Transitioner extends React.Component {


  state = {
    prevChildKey: null,
    prevChild: null
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.childKey && this.props.childKey !== nextProps.childKey) {
      console.log(
        "will transition from ",
        this.props.childKey,
        " to ",
        nextProps.childKey
      );

      this.setState({
        prevChildKey: this.props.childKey,
        prevChild: React.Children.only(this.props.children)
      });
    }
  }

  onAnimationLeaveEnd = () => {
    //Unmount the previous child once it animates out
    this.setState({
      prevChildKey: null,
      prevChild: null
    });
  };

  render() {
    const {
      childKey,
      children
    } = this.props;

    const { prevChildKey, prevChild } = this.state;

    //gets the single child or throws
    const child = React.Children.only(children);

    return (
      <View
        style={{
          flex: 1
        }}
      >
      
        {/*using raw Animated views */}
        {prevChildKey &&
          <AnimatedViewSlideOutLeft
            key={prevChildKey}
            onAnimationEnd={this.onAnimationLeaveEnd}
          >
            {prevChild}
          </AnimatedViewSlideOutLeft>}

        <AnimatedViewSlideInRight key={childKey}>
          {child}
        </AnimatedViewSlideInRight>

      </View>
    );
  }
}

const styles2 = StyleSheet.create({
  absoluteContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
});
