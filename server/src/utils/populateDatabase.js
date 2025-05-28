/* eslint-disable no-console */
import mongoose from "mongoose";

import { assetModel } from "../models/assetModel.js";
import { categoryModel } from "../models/categoryModel.js";
import { projectModel } from "../models/projectModel.js";
import { tagModel } from "../models/tagModel.js";
import { userModel } from "../models/userModel.js";
const BASE_URL = `https://assetstore.vconestoga.com/api/asset`; //Change this value depending on if you are on the server or local
const PROJECTS_API_URL = `https://varlabstorage.blob.core.windows.net/project-images`;
// const BASE_URL = `http://localhost:3000/api/asset`;

mongoose.set("strictQuery", true);

/**
 * Populates the database with default data.
 */
const populateDatabase = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/Asset_Store");
    let userExists = false;
    // Drop all collections if they exist
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    for (const collection of collections) {
      if (collection.name !== "User") {
        console.log(`Previous collection deleted: ${collection.name}`);
        await mongoose.connection.db.dropCollection(collection.name);
      } else {
        userExists = true;
      }
    }

    // ----------- USERS -----------
    // create a user named admin
    if (!userExists) {
      const adminUser = new userModel({
        hash: "65509aa26f5d390c57e3dd28b9e1e7d4b9794f6b98573be2a1e12fcaf57a9260247fa1ed339780a1c1196d8cbef0073d3eaa1fb81e021e4ae2d54e66105c03f8",
        picture: "default",
        role: "admin",
        salt: "78d99210af4c49dbb564ef5530a264948b62a71f31705006c02eb3938ca56f4f",
        username: "admin"
      });
      await adminUser.save();
    }

    // ----------- TAGS -----------
    const airtankTag = new tagModel({
      name: "airtank"
    });
    await airtankTag.save();

    const threeDTag = new tagModel({
      name: "3d"
    });
    await threeDTag.save();

    const bagTag = new tagModel({
      name: "bag"
    });
    await bagTag.save();

    const publicTag = new tagModel({
      name: "public"
    });
    await publicTag.save();

    const biohazardTag = new tagModel({
      name: "biohazard"
    });
    await biohazardTag.save();

    const boxTag = new tagModel({
      name: "box"
    });
    await boxTag.save();

    const whiteTag = new tagModel({
      name: "white"
    });
    await whiteTag.save();

    const fatstashTag = new tagModel({
      name: "fat stash"
    });
    await fatstashTag.save();

    const gundamTag = new tagModel({
      name: "gundam"
    });
    await gundamTag.save();

    const bigTag = new tagModel({
      name: "big"
    });
    await bigTag.save();

    const AnimeTag = new tagModel({
      name: "anime"
    });
    await AnimeTag.save();

    const stetcherTag = new tagModel({
      name: "stretcher"
    });
    await stetcherTag.save();

    const medicalTag = new tagModel({
      name: "medical"
    });
    await medicalTag.save();

    const colourTag = new tagModel({
      name: "colour"
    });
    await colourTag.save();

    const batteryTag = new tagModel({
      name: "battery"
    });
    await batteryTag.save();

    const metallicTag = new tagModel({
      name: "metallic"
    });
    await metallicTag.save();

    // ----------- CATEGORIES -----------

    const textureCategory = new categoryModel({
      image: `${BASE_URL}/image?imageName=texture_cat.jpg`,
      name: "texture"
    });
    await textureCategory.save();

    const modelCategory = new categoryModel({
      image: `${BASE_URL}/image?imageName=model_cat.png`,
      name: "model"
    });
    await modelCategory.save();

    const VideoCategory = new categoryModel({
      name: "video"
    });
    await VideoCategory.save();

    const AudioCategory = new categoryModel({
      name: "audio"
    });
    await AudioCategory.save();

    const spritesCategory = new categoryModel({
      name: "sprite"
    });
    await spritesCategory.save();

    const hdriCategory = new categoryModel({
      name: "hdri"
    });
    await hdriCategory.save();

    const imagesCategory = new categoryModel({
      name: "image"
    });
    await imagesCategory.save();

    // ----------- PROJECTS -----------

    const ambulanceProj = new projectModel({
      description: "A project to promote public health.",
      image: `${PROJECTS_API_URL}/ambulance.webp`,
      name: "ambulance"
    });
    await ambulanceProj.save();

    const climateChangeProj = new projectModel({
      description: "A project to combat climate change.",
      image: `${PROJECTS_API_URL}/climateChange.webp`,
      name: "climate change"
    });
    await climateChangeProj.save();

    const fireProj = new projectModel({
      description: "A project to improve fire fighting capabilities.",
      image: `${PROJECTS_API_URL}/firefighting.webp`,
      name: "fire fighting"
    });
    await fireProj.save();

    const hydroProj = new projectModel({
      description: "A project to improve hydro line safety",
      image: `${PROJECTS_API_URL}/hydroLine.webp`,
      name: "hydro line"
    });
    await hydroProj.save();

    const mechanicProj = new projectModel({
      description: "A project about motive power shop safety.",
      image: `${PROJECTS_API_URL}/mechanicBay.webp`,
      name: "motive power shop safety"
    });
    await mechanicProj.save();

    const phiProj = new projectModel({
      description: "A project about public health inspection.",
      image: `${PROJECTS_API_URL}/phi.webp`,
      name: "public health inspection"
    });
    await phiProj.save();

    const truckProj = new projectModel({
      description: "A project about truck inspection",
      image: `${PROJECTS_API_URL}/truckInspection.webp`,
      name: "truck inspection"
    });
    await truckProj.save();

    const weldingProj = new projectModel({
      description: "A project about welding.",
      image: `${PROJECTS_API_URL}/welding.webp`,
      name: "welding"
    });
    await weldingProj.save();

    const GundamnProj = new projectModel({
      description: "ITS GUNDAMS.",
      image: `${PROJECTS_API_URL}/gundam1.png`,
      name: "Gundam"
    });
    await GundamnProj.save();

    // ----------- ASSETS -----------

    const asset1 = new assetModel({
      categories: [modelCategory._id],
      description: "An air tank model",
      fileName: "Airtank_DClass.fbx",
      fileSize: 129820,
      format: "FBX",
      license: "Conestoga",
      model: {
        animationCount: 2,
        edges: 530,
        lodCount: 3,
        polygons: 5000,
        rigType: "NONE",
        textureCount: 15,
        triCount: 7000,
        vertices: 8000
      },
      name: "Airtank",
      origin: "Conestoga Asset Store",
      previews: [
        `${BASE_URL}/image?imageName=airtank1.png`,
        `${BASE_URL}/image?imageName=airtank2.png`,
        `${BASE_URL}/image?imageName=airtank3.png`
      ],
      price: 0,
      projects: [ambulanceProj._id],
      tags: [airtankTag._id, threeDTag._id]
    });
    await asset1.save();

    const asset2 = new assetModel({
      categories: [modelCategory._id],
      description: "A model of a biohazard bag",
      fileName: "Bag_Biohazard.fbx",
      fileSize: 24860,
      format: "FBX",
      license: "Conestoga",
      model: {
        animationCount: 0,
        edges: 330,
        lodCount: 0,
        polygons: 165,
        rigType: "NONE",
        textureCount: 1,
        triCount: 220,
        vertices: 660
      },
      name: "Bag Biohazard",
      origin: "Conestoga Asset Store",
      previews: [
        `${BASE_URL}/image?imageName=biobag1.png`,
        `${BASE_URL}/image?imageName=biobag2.png`,
        `${BASE_URL}/image?imageName=biobag3.png`
      ],
      price: 0,
      projects: [climateChangeProj._id],
      tags: [fatstashTag._id, bagTag._id, boxTag._id]
    });
    await asset2.save();

    const asset3 = new assetModel({
      categories: [modelCategory._id],
      description: "A white box...",
      fileName: "FatStashJar_WhiteBox.fbx",
      fileSize: 11596,
      format: "FBX",
      license: "Conestoga",
      model: {
        animationCount: 0,
        edges: 18,
        lodCount: 0,
        polygons: 9,
        rigType: "NONE",
        textureCount: 12,
        triCount: 12,
        vertices: 36
      },
      name: "Fat Stash Jar WhiteBox",
      origin: "Conestoga Asset Store",
      previews: [
        `${BASE_URL}/image?imageName=fatstash_whitebox1.png`,
        `${BASE_URL}/image?imageName=fatstash_whitebox2.png`,
        `${BASE_URL}/image?imageName=fatstash_whitebox3.png`
      ],
      price: 0,
      projects: [phiProj._id],
      tags: [boxTag._id, whiteTag._id, fatstashTag._id, publicTag._id]
    });
    await asset3.save();

    const asset4 = new assetModel({
      categories: [modelCategory._id],
      description: "All the gundams",
      fileName: "GundamTest.glb",
      fileSize: 731022192,
      format: "FBX",
      license: "Conestoga",
      model: {
        animationCount: 0,
        edges: 15906274,
        lodCount: 0,
        polygons: 7953137,
        rigType: "FK",
        textureCount: 38,
        triCount: 10604183,
        vertices: 31812549
      },
      name: "Gundam Test",
      origin: "Conestoga Asset Store",
      previews: [
        `${BASE_URL}/image?imageName=gundam1.png`,
        `${BASE_URL}/image?imageName=gundam2.png`,
        `${BASE_URL}/image?imageName=gundam3.png`
      ],
      price: 725000000,
      projects: [GundamnProj._id, mechanicProj._id, hydroProj._id],
      tags: [bigTag._id, gundamTag._id, AnimeTag._id]
    });
    await asset4.save();

    const asset5 = new assetModel({
      categories: [modelCategory._id],
      description: "Stretcher LOD 0",
      fileName: "PowerStretcher_LOD_0_v1.fbx",
      fileSize: 2173068,
      format: "FBX",
      license: "Conestoga",
      model: {
        animationCount: 0,
        edges: 15974,
        lodCount: 3,
        polygons: 7937,
        rigType: "FK",
        textureCount: 38,
        triCount: 106183,
        vertices: 3149
      },
      name: "Power Stretcher",
      origin: "Conestoga Asset Store",
      previews: [
        `${BASE_URL}/image?imageName=powerstretcher1.png`,
        `${BASE_URL}/image?imageName=powerstretcher2.png`,
        `${BASE_URL}/image?imageName=powerstretcher3.png`,
        `${BASE_URL}/image?imageName=powerstretcher4.png`
      ],
      price: 0,
      projects: [ambulanceProj._id, mechanicProj._id],
      tags: [publicTag._id, stetcherTag._id, medicalTag]
    });
    await asset5.save();

    const asset6 = new assetModel({
      categories: [textureCategory._id],
      description: "Colour texture for air tanks",
      fileName: "Airtank_DClass_colour.png",
      fileSize: 2173068,
      format: "png",
      license: "Conestoga",
      name: "Airtank Colour",
      origin: "Conestoga Asset Store",
      previews: [`${BASE_URL}/image?imageName=airtank_colour1.png`],
      price: 0,
      projects: [phiProj._id, fireProj._id],
      tags: [publicTag._id, airtankTag._id, medicalTag._id],
      texture: {
        height: 1024,
        type: "colour",
        width: 1024
      }
    });
    await asset6.save();

    const asset7 = new assetModel({
      categories: [textureCategory._id],
      description: "Colour texture for car battery",
      fileName: "CarBattery_colour.png",
      fileSize: 2173068,
      format: "png",
      license: "Conestoga",
      name: "Car Battery Colour",
      origin: "Conestoga Asset Store",
      previews: [
        `${BASE_URL}/image?imageName=carbattery1.png`,
        `${BASE_URL}/image?imageName=carbattery2.png`
      ],
      price: 0,
      projects: [mechanicProj._id, truckProj._id],
      tags: [publicTag._id, colourTag._id, batteryTag._id],
      texture: {
        height: 1024,
        type: "colour",
        width: 1024
      }
    });
    await asset7.save();

    const asset8 = new assetModel({
      categories: [textureCategory._id],
      description: "Metallic texture for Rust",
      fileName: "Rust_Decal_metallic.png",
      fileSize: 2173068,
      format: "png",
      license: "Conestoga",
      name: "Rust Decal Metallic",
      origin: "Conestoga Asset Store",
      previews: [
        `${BASE_URL}/image?imageName=rustdecal_metallic1.png`,
        `${BASE_URL}/image?imageName=rustdecal_metallic2.png`
      ],
      price: 0,
      projects: [hydroProj._id, climateChangeProj._id, weldingProj._id],
      tags: [publicTag._id, metallicTag._id],
      texture: {
        height: 1024,
        type: "Metallic",
        width: 1024
      }
    });
    await asset8.save();

    const asset9 = new assetModel({
      categories: [modelCategory._id],
      description: "Container for sharp objects",
      fileName: "Container_Sharps_Production.blend",
      fileSize: 1543000,
      format: "blend",
      license: "Conestoga",
      name: "Container Sharps Production",
      origin: "Conestoga Asset Store",
      previews: [
        `${BASE_URL}/image?imageName=sharp_container1.png`,
        `${BASE_URL}/image?imageName=sharp_container2.png`
      ],
      price: 0,
      production: {
        glb: "Container_Sharps_Production.glb",
        type: "blend"
      },
      projects: [ambulanceProj._id],
      tags: [publicTag._id]
    });
    await asset9.save();

    const asset10 = new assetModel({
      categories: [modelCategory._id],
      description: "ZIP for Airtank M60 Asset",
      fileName: "Airtank_M60.zip",
      fileSize: 2173068,
      format: "ZIP",
      license: "Conestoga",
      model: {
        animationCount: 0,
        edges: 15974,
        lodCount: 3,
        polygons: 7937,
        rigType: "FK",
        textureCount: 38,
        triCount: 106183,
        vertices: 3149
      },
      name: "Airtank M60",
      origin: "Conestoga Asset Store",
      previews: [
        `${BASE_URL}/image?imageName=airtank_m60_1.png`,
        `${BASE_URL}/image?imageName=airtank_m60_2.png`
      ],
      price: 0,
      projects: [ambulanceProj._id, mechanicProj._id],
      tags: [publicTag._id, stetcherTag._id, medicalTag]
    });
    await asset10.save();

    console.log(
      `Database populated with ${await userModel.countDocuments()} users, ${await assetModel.countDocuments()} assets, ${await projectModel.countDocuments()} projects, ${await tagModel.countDocuments()} tags, and ${await categoryModel.countDocuments()} categories`
    );
  } catch (err) {
    console.error("Error creating tags", err);
  } finally {
    mongoose.connection.close();
  }
};

populateDatabase();
