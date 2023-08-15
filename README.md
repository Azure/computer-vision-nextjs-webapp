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

# Project

> This repo has been populated by an initial template to help get you started. Please
> make sure to update the content to build a great experience for community-building.

As the maintainer of this project, please make a few updates:

- Improving this README.MD file to provide a great experience
- Updating SUPPORT.MD with content about this project's support experience
- Understanding the security reporting process in SECURITY.MD
- Remove this section from the README

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft 
trademarks or logos is subject to and must follow 
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.

## Further reading

* [Azure Container Apps documentation](https://learn.microsoft.com/en-us/azure/container-apps/)
* [Azure Database for PostgreSQL documentation](https://learn.microsoft.com/en-us/azure/postgresql/)
* [Azure Blob Storage documentation](https://learn.microsoft.com/en-us/azure/storage/blobs/)
* [Azure Computer (AI) Vision Documentation](https://learn.microsoft.com/en-us/azure/ai-services/computer-vision/)
