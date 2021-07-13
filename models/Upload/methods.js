import S3 from "aws-sdk/clients/s3"
import uniqid from "uniqid"
import mime from "mime"

export const createPresignedPost = ({ key, contentType }) => {
  const s3 = new S3();
  const params = {
    Expires: 60,
    Bucket: "presigned-post-data",
    Conditions: [["content-length-range", 100, 2*1024*1024]], // 100Byte - 2MB
    Fields: {
      "Content-Type": contentType,
      key
    }
  };
  return new Promise(async (resolve, reject) => {
    s3.createPresignedPost(params, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
};


const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true
};

export const getPresignedPostData = async (name, type, bucketkey, res) => {
  const presignedPostData = await createPresignedPost({
    key: `${bucketkey}_${name}`,
    contentType: mime.getType(type)
  });

  return res.status(200).send({data: presignedPostData})
};

const methods = {
  signS3: async (req, res, next) => {
    try {
      const user = req.user
      if (!user || !user.imagepath) {
        return res.status(401).send({errors: {email: {message: 'Error authenticating.'}}})
      }

      const bucketkey = user.imagepath
      const body = req.body

      if (!body.name || !body.type) {
        return res.status(401).send({errors: {unknown: {message: 'Missing parameters.'}}})
      }

      let name = body.name
      let ext = name.split('.')[-1]

      return await getPresignedPostData(ext, body.type, bucketkey, res)
    } catch (e) {
      return res.status(401).send({errors: {unknown: {message: 'Unknown error.'}}})
    }
  },
};

export default methods
