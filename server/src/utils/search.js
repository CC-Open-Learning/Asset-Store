import { assetModel } from "../models/assetModel.js";
import { categoryModel } from "../models/categoryModel.js";
import { projectModel } from "../models/projectModel.js";
import { tagModel } from "../models/tagModel.js";
import logger from "../utils/logger.js";
import { queryTerms } from "../utils/validate.js";

/**
 * ----------------------------------------------------------------------------------
 * Recursive search of a given schema to determine if the property
 * being search for exists in the schema.
 * @param property The property to search for.
 * @param schema The schema to search in.
 */
export function checkPaths(property, schema) {
  let retValue = false;
  try {
    schema.eachPath((path, schemaType) => {
      if (schemaType.schema) {
        if (!retValue) {
          retValue = checkPaths(property, schemaType.schema);
        }
      } else if (path === property) {
        retValue = true;
      }
    });
  } catch (error) {
    logger.error(`Error checking schema paths: ${error}`);
  }
  return retValue;
}

/**
 * ----------------------------------------------------------------------------------
 * Performs a search for assets based on the provided query.
 * @param query The query to search for.
 * @param select The fields to select.
 */
export const getAssets = async (query, select) => {
  const results = await assetModel
    .find(query)
    .select(select)
    .populate({
      path: "name"
    })
    .populate({
      path: "tags",
      select: "name"
    })
    .populate({
      path: "projects",
      select: "name"
    })
    .populate({
      path: "categories",
      select: "name"
    })
    .populate({
      path: "previews"
    });
  return results;
};

/**
 * ----------------------------------------------------------------------------------
 * Performs a search for an asset by ID.
 * @param query The query to search for.
 * @param select The fields to select.
 */
export const findAssetById = async (query, select) => {
  return await assetModel
    .findById(query._id)
    .select(select)
    // Populate will add the sub-schema info for each item to the returned asset
    // instead of just displaying ObjectIds
    .populate({
      path: "name"
    })
    .populate({
      path: "tags",
      select: "name"
    })
    .populate({
      path: "tags",
      select: "name"
    })
    .populate({
      path: "projects",
      select: "name"
    })
    .populate({
      path: "categories",
      select: "name"
    });
};

/**
 * ----------------------------------------------------------------------------------
 * Grab the name string from each matching document/object, convert to
 * lowercase, and add to the matches array to return (if the name does not exist yet).
 * @param matchingDocuments Array of documents to process.
 * @param matches Array to store unique names.
 */
export const addNamesToAutocompleteArray = (matchingDocuments, matches) => {
  matchingDocuments.forEach(document => {
    const name = document.name.toLowerCase();
    if (!matches.includes(name)) {
      matches.push(name);
    }
  });
};

/**
 * ----------------------------------------------------------------------------------
 * Find and return all asset, tag, project, or category names that could
 * autocomplete the user's input (removing duplicates).
 * @param input The input to search for.
 */
export const getNamesOfPartialMatchingDocuments = async input => {
  const matches = [];
  let selectedInput = input;
  //remove regex chars from input to prevent it from affecting regex pattern/ crashing server
  selectedInput = selectedInput.replace(/[.*+?^${}()|[\]\\]/g, "");

  //look for the input anywhere in the name but make sure it's at the start of the word (eg. "ai" --> returns AIr but not hAIr)
  const pattern = `^${selectedInput}| ${selectedInput}`;
  const regexCheck = { name: { $options: "i", $regex: pattern } }; //check name field & ignore case

  //get all documents that contain the input in their names
  const matchingAssets = await assetModel.find(regexCheck, "name -_id"); //(select only name property to return)
  const matchingTags = await tagModel.find(regexCheck, "name -_id");
  const matchingProjects = await projectModel.find(regexCheck, "name -_id");
  const matchingCategories = await categoryModel.find(regexCheck, "name -_id");

  //add name strings to matches array if they don't already exist
  addNamesToAutocompleteArray(matchingAssets, matches);
  addNamesToAutocompleteArray(matchingTags, matches);
  addNamesToAutocompleteArray(matchingProjects, matches);
  addNamesToAutocompleteArray(matchingCategories, matches);

  return matches;
};

/**
 * ----------------------------------------------------------------------------------
 * Function to retrieve project collection information from the database.
 * Select option is for filtering queries for specific queries.
 * @param projectNames Array of project names to search for.
 * @param selectOption Object to select specific fields from the Project collection.
 */
export const getProjects = async (projectNames, selectOption = {}) => {
  try {
    let result = [];
    for (const projectName of projectNames) {
      const projects = await projectModel
        .find({
          name: { $options: "i", $regex: `\\b${projectName}\\b` } // match whole word
        })
        .select(selectOption); // Full text search

      result = result.concat(projects);
    }
    return result;
  } catch (error) {
    logger.error(`Error getting project: ${error}`);
    throw error;
  }
};

/**
 * ----------------------------------------------------------------------------------
 * Function to retrieve Category collection information from the database.
 * Select option is for filtering queries for specific queries.
 * @param categoryNames Array of category names to search for.
 * @param selectOption Object to select specific fields from the Category collection.
 */
export const getCategories = async (categoryNames, selectOption = {}) => {
  try {
    let result = [];
    for (const categoryName of categoryNames) {
      const categories = await categoryModel
        .find({
          name: { $options: "i", $regex: `\\b${categoryName}\\b` } // match whole word
        })
        .select(selectOption); // Full text search

      result = result.concat(categories);
    }
    return result;
  } catch (error) {
    logger.error(`Error getting categories: ${error}`);
    throw error;
  }
};

/**
 * ----------------------------------------------------------------------------------
 * Function to retrieve Tag collection information from the database.
 * Select option is for filtering queries for specific queries.
 * @param tagNames Array of tag names to search for.
 * @param selectOption Object to select specific fields from the Tag collection.
 */
export const getTags = async (tagNames, selectOption = {}) => {
  try {
    let result = [];
    for (const tagName of tagNames) {
      const tags = await tagModel
        .find({
          name: { $options: "i", $regex: `\\b${tagName}\\b` } // match whole word
        })
        .select(selectOption);

      result = result.concat(tags);
    }
    return result;
  } catch (error) {
    logger.error(`Error getting tags: ${error}`);
    throw error;
  }
};

/**
 * ----------------------------------------------------------------------------------
 * Gets object Ids and stores them in an array to be stored in the database.
 * @param objs The objects to process.
 */
export function processObjectId(objs) {
  // eslint-disable-next-line prefer-const
  let idStrings = [];
  objs.forEach(obj => {
    idStrings.push(obj._id.toString());
  });

  return idStrings;
}

/**
 * ----------------------------------------------------------------------------------
 * Builds queries for number comparisons like lte or gte.
 * @param operator The operator to use.
 * @param value The value to compare.
 */
export function buildNumberComparison(operator, value) {
  // eslint-disable-next-line prefer-const
  let numberQuery = {};
  switch (operator) {
    case "gte":
      numberQuery.$gte = parseInt(value);
      break;
    case "lte":
      numberQuery.$lte = parseInt(value);
      break;
    default:
      break;
  }

  return numberQuery;
}

/**
 * ----------------------------------------------------------------------------------
 * Builds a case insensitive query based on any property in the search object.
 * @param searchTerms The search terms to build a query from.
 */
export function buildQueryObject(searchTerms) {
  let query = {};

  if (typeof searchTerms === "object") {
    Object.keys(searchTerms).forEach(key => {
      const value = searchTerms[key];
      const keyParts = key.split(".");
      const operator = keyParts.pop();

      // Handle $and and $or as special cases
      if (key === "$and" || key === "$or") {
        query = searchTerms;

        //If the value is an array and not a mongoose search modifier, join
        // all the values using or ("|")
      } else if (Array.isArray(value)) {
        query[key] = { $options: "i", $regex: value.join("|") };

        //If the key has an operator like lte or gte, build a number comparison query
        //ex. model.triCount.lte = 3 (models whose triCount is less than or equal to 3)
      } else if (operator === "lte" || operator === "gte") {
        const newKey = keyParts.join(".");

        //Builds number query and uses spread to add operators to the same key like when there
        // is both gte and lte
        query[newKey] = {
          ...query[newKey],
          ...buildNumberComparison(operator, value)
        };

        // if the value is not a number and not an array the search term is placed straight into a new object
        // as part of the greater query object
        // This condition executes with any other query that isnt a number or array
      } else if (!isNaN(value)) {
        query[key] = searchTerms[key];
      } else {
        // Default case insensitive query
        query[key] = { $options: "i", $regex: value };
      }
    });
  }

  return query;
}

/**
 * ----------------------------------------------------------------------------------
 * Loops through the object and flattens it into a dot notation.
 * @param ob - The object to flatten.
 * @example
 * const query = { asset: { model: { triCount: 5 } } };
 * const flattened = flattenObj(query);
 * console.log(flattened); // { 'asset.model.triCount': 5 }
 */
export const flattenObj = ob => {
  // eslint-disable-next-line prefer-const
  let result = {};
  for (const i in ob) {
    if (typeof ob[i] === "object" && !Array.isArray(ob[i])) {
      const temp = flattenObj(ob[i]);
      for (const j in temp) {
        if (Object.hasOwn(temp, j)) {
          // Store temp in result
          result[`${i}.${j}`] = temp[j];
        }
      }
    } else {
      result[i] = ob[i];
    }
  }
  return result;
};

/**
 * ----------------------------------------------------------------------------------
 * Performs a search for assets based on the provided query.
 * @param query The query to search for.
 */
export const assetSearch = async query => {
  // Flattens search object to help mongoose search for assets
  // Mongoose accepts objects with the dot notation with more ease than layered complex objects
  const flattenedQueries = flattenObj(query);
  //Check if query terms are valid, always true if keyword search
  if (queryTerms(flattenedQueries)) {
    if (query._id) {
      //return result of ID search
      return await findAssetById(query);
    }
    //Execute this if the query isn't searching for an ID

    // Build a searchable query based on the submitted terms
    const newQuery = buildQueryObject(flattenedQueries);
    // Return result of search
    return await getAssets(newQuery);
  }
  logger.info(`No assets found for query: ${query}`);
  return {};
};

/**
 * ----------------------------------------------------------------------------------
 * Performs the keyword search.
 * @param keywords The keywords to search for.
 * @param select The fields to select.
 */
export const keywordSearch = async (keywords, select) => {
  //Find matches for each schema type based on the provided keywords
  const [matchingTags, matchingCategories, matchingProjects, matchingAssets] =
    await Promise.all([
      getTags(keywords, select),
      getCategories(keywords, select),
      getProjects(keywords, select),
      getAssets(
        {
          $or: [
            ...keywords.map(keyword => ({
              $or: [{ name: { $options: "i", $regex: keyword } }]
            }))
          ]
        },
        select
      )
    ]);
  const NO_RESULTS = 0;
  let result = matchingAssets;

  //If there are matching projects, find assets that are associated with them
  if (matchingProjects.length > NO_RESULTS) {
    const assets = await getAssets(
      {
        $or: [
          { projects: { $in: matchingProjects.map(project => project._id) } }
        ]
      },
      select
    );
    result = result.concat(assets);
  }

  //If there are matching tags, find assets that are associated with them
  if (matchingTags.length > NO_RESULTS) {
    const assets = await getAssets(
      {
        $or: [{ tags: { $in: matchingTags.map(tag => tag._id) } }]
      },
      select
    );
    result = result.concat(assets);
  }

  //If there are matching categories, find assets that are associated with them
  if (matchingCategories.length > NO_RESULTS) {
    const assets = await getAssets(
      {
        $or: [
          {
            categories: {
              $in: matchingCategories.map(category => category._id)
            }
          }
        ]
      },
      select
    );
    result = result.concat(assets);
  }

  // Remove duplicates from the result array
  result = Array.from(
    new Map(result.map(item => [item._id.toString(), item])).values()
  );

  return result;
};

/**
 * ----------------------------------------------------------------------------------
 * Determines if tag exists in the database based on its name.
 * @param tag The name of the tag to check.
 */
export const findTag = async tag => {
  return await tagModel.findOne({ name: tag });
};

/**
 * ----------------------------------------------------------------------------------
 * Check if the exact given project name already exists in the database
 * (ignoring case).
 * @param projectName The name of the project to check.
 */
export const findProjectByName = async projectName => {
  return await projectModel.findOne({
    name: { $regex: new RegExp(`^${projectName}$`, "i") }
  });
};
