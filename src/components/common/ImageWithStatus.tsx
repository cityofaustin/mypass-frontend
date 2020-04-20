import React, { Component, Fragment } from 'react';
import classNames from 'classnames';
import './ImageWithStatus.scss';
import ProgressIndicator from './ProgressIndicator';
import ZipUtil from '../../util/ZipUtil';
import CryptoUtil from '../../util/CryptoUtil';

export enum ImageViewTypes {
  GRID_LAYOUT,
  GRID_CIRCLE_LAYOUT,
  LIST_LAYOUT,
  PREVIEW
}

interface ImageWithStatusProps {
  imageUrl?: string;
  encrypted?: boolean;
  imageViewType: ImageViewTypes;
  privateEncryptionKey?: string;
}

interface ImageWithStatusState {
  imageStatus: ImageStatus;
  base64Image?: string;
}

enum ImageStatus {
  Loading = 'loading',
  Failed = 'failed to load',
  Loaded = 'loaded'
}

class ImageWithStatus extends Component<ImageWithStatusProps,
  ImageWithStatusState> {
  constructor(props: Readonly<ImageWithStatusProps>) {
    super(props);
    this.state = {
      imageStatus: ImageStatus.Loading
    };
  }

  async componentWillReceiveProps(nextProps: Readonly<ImageWithStatusProps>) {
    // debugger;
    if (nextProps.imageUrl && nextProps.imageUrl !== this.props.imageUrl
      && nextProps.encrypted && nextProps.privateEncryptionKey) {
      let base64Image: string = '';
      // console.log(imageUrl);
      const encryptedString: string = await ZipUtil.unzip(nextProps.imageUrl);
      // console.log(encryptedString);
      base64Image = await CryptoUtil.getDecryptedString(nextProps.privateEncryptionKey!, encryptedString);
      // console.log(base64Image);
      this.setState({ base64Image });
    }
  }

  async componentDidMount(): Promise<void> {
    const { imageUrl, encrypted, privateEncryptionKey } = { ...this.props };
    let base64Image: string = '';
    if (encrypted && imageUrl) {
      // console.log(imageUrl);
      const encryptedString: string = await ZipUtil.unzip(imageUrl);
      // console.log(encryptedString);
      base64Image = await CryptoUtil.getDecryptedString(privateEncryptionKey!, encryptedString);
      // console.log(base64Image);
    }
    this.setState({ base64Image });
  }

  handleImageLoaded = () => {
    this.setState({ imageStatus: ImageStatus.Loaded });
  };

  handleImageErrored = () => {
    this.setState({ imageStatus: ImageStatus.Failed });
  };

  render() {
    const { imageUrl, imageViewType, encrypted } = { ...this.props };
    const { imageStatus, base64Image } = { ...this.state };
    return (
      <Fragment>
        {/* <pre style={{width: '200px'}}>base64: {base64Image}</pre> */}
        <div className="image-with-status">
          {imageStatus === 'loading' && (
            <div
              className={classNames({
                'loading-outter': true,
                'outter-doc': imageViewType === ImageViewTypes.GRID_LAYOUT || ImageViewTypes.PREVIEW,
                'outter-circle':
                  imageViewType === ImageViewTypes.GRID_CIRCLE_LAYOUT,
                'outter-list': imageViewType === ImageViewTypes.LIST_LAYOUT,
              })}
            >
              <div className="loading-inner">
                <ProgressIndicator />
              </div>
            </div>
          )}

          {encrypted && base64Image && (
            <img
              className={classNames({
                loading: (imageStatus === 'loading' || base64Image === ''),
                'image-doc': imageViewType === ImageViewTypes.GRID_LAYOUT,
                'img-circle': imageViewType === ImageViewTypes.GRID_CIRCLE_LAYOUT,
                'list-img': imageViewType === ImageViewTypes.LIST_LAYOUT,
                'preview': imageViewType === ImageViewTypes.PREVIEW
              })}
              src={base64Image as string}
              onLoad={this.handleImageLoaded}
              onError={this.handleImageErrored}
              alt={''}
            />
          )}

          {!encrypted && (
            <img
              className={classNames({
                loading: imageStatus === 'loading',
                'image-doc': imageViewType === ImageViewTypes.GRID_LAYOUT,
                'img-circle': imageViewType === ImageViewTypes.GRID_CIRCLE_LAYOUT,
                'list-img': imageViewType === ImageViewTypes.LIST_LAYOUT,
                'preview': imageViewType === ImageViewTypes.PREVIEW
              })}
              src={imageUrl}
              onLoad={this.handleImageLoaded}
              onError={this.handleImageErrored}
              alt={''}
            />
          )}

          {/*{imageStatus}*/}
        </div>
      </Fragment>
    );
  }
}

export default ImageWithStatus;
