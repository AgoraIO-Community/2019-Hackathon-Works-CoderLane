import React from 'react';
import { connect } from "react-redux";
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import cn from 'classnames';
import LiveVideo from './LiveVideo';
import { getToken } from '../../actions';
import './style.scss';

const appId = '8e99e984bc5c4abf81ee9b53e6e21fe5';

class Live extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShow: false,
      videoCell: {},
      isVideo: false,
      isAudio: false,
    }
    this.uid = __socket__.id;
  }
  componentDidMount() {
    const { sandbox: { _id }, getTokenAction } = this.props;

    getTokenAction({ uid: this.uid, channel: _id });
    this.client = AgoraRTC.createClient({mode: 'rtc'});
    this.client.on('error', (err) => {
      console.log("发生了一个错误: ", err.reason);
    });
    this.client.on('stream-subscribed', (e) => {
      console.error('接收到远端视频 >> ', e)
      const stream = e.stream;
      const id = stream.getId();
      this.setState({
        videoCell: {
          ...this.state.videoCell,
          [id]: e.stream
        }
      })
    });
    this.client.on('stream-added', (e) => {
      var stream = e.stream;
      console.error('流加入 > ', e);
      // 其他用户加入但是当前用户并未发布视频
      this.client.subscribe(stream, function (err) {
        console.log("订阅视频流失败：", err);
      });
    });
    this.client.on('stream-removed', this.videoLeave);
    this.client.on('peer-leave', this.videoLeave);
    this.setState({ isShow: true, isCollapse: true });
  }
  componentDidUpdate(prevProps) {
    if (this.props.app.token && this.props.app.token !== prevProps.app.token) {
      this.initVideo();
    }
  }
  initVideo() {
    const { sandbox: { _id }, app: { token } } = this.props;

    if(!AgoraRTC.checkSystemRequirements()) {
      alert("Your browser does not support WebRTC!");
    }

    AgoraRTC.getDevices(devices => {
      var defaultAudio, defaultVideo;
      let localStream;

      defaultAudio = _.head(_.filter(devices, function(v) {
        return v.kind === 'audioinput';
      }));
      defaultVideo = _.head(_.filter(devices, function(v) {
        return v.kind === 'videoinput';
      }));
      this.client.init(appId, () => {
        //加入频道
        console.log('token > ', token, _id, this.uid)
        this.client.join(token, _id/* channel id */, this.uid, uid => {
          const localStream = AgoraRTC.createStream({
            streamID: uid,
            audio: true,
            cameraId: defaultVideo.deviceId,
            microphoneId: defaultAudio.deviceId,
            video: true, // 是否开启视频
            screen: false
          });
          this.stream = localStream;
          localStream.setVideoProfile('480p');
          localStream.init(() => {
            localStream.play("preview");
            // 如果创建者自动开启发布流
            // 发布视频流到SD-RTN
            this.client.publish(localStream, (err) => {
              console.error("发布视频流错误: " + err);
            });
          });

        })
      })
    });
  }
  videoLeave = e => {
    const stream = e.stream;
    if (!stream) return false;
    const id = stream.getId();
    stream.stop();
    this.setState({
      videoCell: {
        ..._.filter(this.state.videoCell, (v, k) => {
          debugger;
          return k !== id
        }),
      }
    })
  }
  handleSwitchVideo = () => {
    const { isVideo } = this.state;

    if (isVideo) {
      this.stream.unmuteAudio()
    } else {
      this.stream.muteAudio()
    }
    this.setState({ isVideo: !isVideo });
  }
  handleCollapse = () => {
    const { isShow } = this.state;
    this.setState({ isShow: !isShow });
  }
  render() {
    const { videoCell, isVideo } = this.state;
    const liveClass = cn('live', {
      "live--show": this.state.isShow,
    });

    return (
      <div className={liveClass}>
        <div className="live__collapse" onClick={this.handleCollapse}>
          <svg width="1em" height="1em" viewBox="0 0 24 41" fill="currentColor">
            <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
              <g transform="translate(11.916790, 20.916790) rotate(-270.000000) translate(-11.916790, -20.916790) translate(-8.083210, 8.916790)" fill="currentColor" fillRule="nonzero">
                <path d="M0.0304309064,19.9417533 C0.0307593624,21.4800201 0.957536999,22.8666734 2.37872858,23.4552981 C3.79992015,24.0439229 5.43574251,23.7186393 6.52362556,22.6310847 L19.9683804,9.182526 L33.4169391,22.6310847 C34.371992,23.619924 35.7862814,24.0164996 37.116224,23.6683874 C38.4461666,23.3202752 39.4847923,22.2816495 39.8329045,20.9517069 C40.1810167,19.6217643 39.7844411,18.207475 38.7956018,17.252422 L22.6577117,1.11453195 C21.9449543,0.40106701 20.977823,0.000187054929 19.9693314,0.000187054929 C18.9608397,0.000187054929 17.9937084,0.40106701 17.280951,1.11453195 L1.14496285,17.252422 C0.430484743,17.9649057 0.0293885708,18.9327385 0.0304309064,19.9417533 Z" id="Shape"></path>
              </g>
            </g>
          </svg>
        </div>
        <div className="live__video">
          <div className="live__item" id="preview">
            <div className="live__control" style={{display: 'none'}}>
              <span onClick={this.handleSwitchVideo}>
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
                  {
                    isVideo ?
                      <path d="M13.4246528,0 L1.90868056,0 C0.854513889,0 0,0.854513889 0,1.90868056 L0,13.4246528 C0,14.4788194 0.854513889,15.3333333 1.90868056,15.3333333 L13.4246528,15.3333333 C14.4788194,15.3333333 15.3333333,14.4788194 15.3333333,13.4246528 L15.3333333,1.90868056 C15.3333333,0.854513889 14.4788194,0 13.4246528,0 Z M20.9875,1.50538194 L16.6111111,4.52413194 L16.6111111,10.8092014 L20.9875,13.8239583 C21.8340278,14.4069444 23,13.8119792 23,12.79375 L23,2.53559028 C23,1.52135417 21.8380208,0.922395833 20.9875,1.50538194 Z" id="Shape"></path> :
                      <path d="M22.7416537,16.4372855 L20.7681747,14.9123245 C21.3207488,14.8620905 21.8159126,14.4207488 21.8159126,13.7964119 L21.8159126,4.574883 C21.8159126,3.6599064 20.7717629,3.12527301 20.0074883,3.64914197 L16.074883,6.36177847 L16.074883,11.2847114 L14.9266771,10.3984399 L14.9266771,4.01154446 C14.9266771,3.06427457 14.1588144,2.29641186 13.2115445,2.29641186 L4.44570983,2.29641186 L1.6326053,0.12199688 C1.38143526,-0.0717628705 1.0226209,-0.0287051482 0.825273011,0.222464899 L0.12199688,1.12667707 C-0.0717628705,1.37784711 -0.0287051482,1.73666147 0.222464899,1.93042122 L1.53213729,2.94227769 L14.9266771,13.2976599 L21.3315133,18.249298 C21.5826833,18.4430577 21.9414977,18.4 22.1388456,18.14883 L22.8421217,17.2410296 C23.0394696,16.9934477 22.9928237,16.6310452 22.7416537,16.4372855 Z M1.14820593,14.3597504 C1.14820593,15.3070203 1.91606864,16.074883 2.86333853,16.074883 L13.2115445,16.074883 C13.6134165,16.074883 13.9794072,15.9313573 14.2736349,15.6981279 L1.14820593,5.55085803 L1.14820593,14.3597504 Z" id="Shape"></path>
                  }
                </svg>
              </span>
                {/* <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="video-slash" class="svg-inline--fa fa-video-slash fa-w-20" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                  <path fill="currentColor" d="M633.8 458.1l-55-42.5c15.4-1.4 29.2-13.7 29.2-31.1v-257c0-25.5-29.1-40.4-50.4-25.8L448 177.3v137.2l-32-24.7v-178c0-26.4-21.4-47.8-47.8-47.8H123.9L45.5 3.4C38.5-2 28.5-.8 23 6.2L3.4 31.4c-5.4 7-4.2 17 2.8 22.4L42.7 82 416 370.6l178.5 138c7 5.4 17 4.2 22.5-2.8l19.6-25.3c5.5-6.9 4.2-17-2.8-22.4zM32 400.2c0 26.4 21.4 47.8 47.8 47.8h288.4c11.2 0 21.4-4 29.6-10.5L32 154.7v245.5z"></path>
                </svg> */}
            </div>
          </div>
          {_.map(videoCell, (val, key) => {
            return <LiveVideo key={key} stream={val} />
          })}
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ app, sandbox, user }) => ({
  app,
  user,
  sandbox,
});

const mapDispatchToProps = dispatch => ({
  getTokenAction: bindActionCreators(getToken, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(Live);