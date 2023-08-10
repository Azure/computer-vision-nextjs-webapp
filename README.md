# Create a Container App leveraging Blob Store, SQL, and Computer Vision

Sample app where users can sign up and vote for their preference of cat or dog, using an image of a cat or a dog that will be analyzed by our infrastructure. For this to work, several different azure services are being leveraged:

* **Azure Storage Account** to store the images
* **Azure Database for PostgreSQL** to store users and votes
* **Azure Computer Vision** to analyze the images for cats or dogs
* **Azure Container App** to deploy our code

This is a demo app for the purpose of creating guides for [Microsofts Innovation Engine](https://github.com/Azure/InnovationEngine). User authentication is done with simple email lookup. **This code is not intended for production use, reproduce at your own risk.**

## Deploy and run the app

There is a Dockerfile at the root of this repository that is used to build and containerize the Next.js code for deployment. There are currently two methods for deploying this web application.

* **Deploy from source:** Check `/deployment/documents/fromSource.md` for instructions on how to clone, build, and deploy the source code
* **Deploy from image:** Check `/deployment/documents/fromImage.md` fromImage.md for instructions on how to deploy from a prebuilt Docker 

## Further reading

* [Azure Container Apps documentation](https://learn.microsoft.com/en-us/azure/container-apps/)
* [Azure Database for PostgreSQL documentation](https://learn.microsoft.com/en-us/azure/postgresql/)
* [Azure Blob Storage documentation](https://learn.microsoft.com/en-us/azure/storage/blobs/)
* [Azure Computer (AI) Vision Documentation](https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/)
