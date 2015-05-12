// IMPORTS =========================================================================================
import {filter} from "ramda";
import Axios from "axios";
import {getTotalPages, getLastOffset} from "frontend/helpers/pagination";
import state from "frontend/state";
import router from "frontend/router";
import fetchIndex from "frontend/actions/fetch-index/robot";

// ACTIONS =========================================================================================
export default function loadIndex() {
  console.debug("loadIndex()");

  handleUnexistingOffset();
  if (!isCacheAvailable()) {
    fetchIndex().then(handleUnexistingOffset);
  }
}

export function isCacheAvailable() {
  let cursor = state.select("robots");
  let total = cursor.get("total");
  let offset = cursor.get("offset");
  let limit = cursor.get("limit");
  let pagination = cursor.get("pagination");

  let ids = filter(v => v, pagination.slice(offset, offset + limit));
  if (ids && ids.length) {
    if (offset == getLastOffset(total, limit)) {
      let totalPages = getTotalPages(total, limit);
      return ids.length >= limit - ((totalPages * limit) - total);
    } else {
      return ids.length >= limit;
    }
  } else {
    return false;
  }
}

function handleUnexistingOffset() {
  let cursor = state.select("robots");
  let total = cursor.get("total");
  let offset = cursor.get("offset");
  let limit = cursor.get("limit");
  let lastOffset = getLastOffset(total, limit);

  if (total && offset > lastOffset) {
    router.transitionTo(
      undefined,                   // route
      undefined,                   // params
      undefined,                   // query
      {},                          // withParams
      {page: {offset: lastOffset}} // withQuery
    );
  }
}