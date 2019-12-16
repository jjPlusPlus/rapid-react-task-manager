import React, { useState, useCallback } from "react";

import { withRouter } from "react-router-dom";

import { connect } from "react-redux";
import { firebaseConnect } from "react-redux-firebase";
import { compose } from "recompose";
import { AnyAction, Dispatch } from "redux";

import { AppState, Card } from "../types";

import { removeCard, updateCard } from "../actions";

import RemoveButton from "./buttons/RemoveButton";
import EditableField from "./EditableField";

import ReactMarkdown from "react-markdown";

import Moment from "react-moment";

import { pathToRegexp } from "path-to-regexp";

import { useLocation } from "react-router-dom";

interface CardDetailProps {
  columns: any;
  detail: any;
  updateCard: any;
  removeCard: any;
  boards: any;
  match: any;
  location: any;
  auth: any;
}
interface CardDetailState {
  showPreview: boolean;
}

const CardDetail = (props: CardDetailProps) => {
  const [showPreview, togglePreview] = useState(true);

  const { detail } = props;

  // get the current board from the path
  let boardId = "";
  const location = useLocation().pathname;
  const keys: any = [];
  const regex = pathToRegexp("/board/:id", keys);
  const result = regex.exec(location) || [];
  boardId = result[1];

  const handleInputChange = useCallback((field, value) => {
    props.updateCard(boardId, detail.column, card.id, field, value);
  }, []);

  const handleMarkdownChange = useCallback((event) => {
    props.updateCard(boardId, detail.column, card.id, "description", event.target.value);
  }, []);

  if (!boardId) { return (<div>Board Error: Could not parse Board ID from the Route. </div>); }

  const boards = props.boards;
  const board = boards[boardId];

  if (!board) { return (<div className="card-detail">Error: Board not found</div>); }

  // get the current column from the board
  const column = board.columns[detail.column];
  if (!column) { return (<div className="card-detail">Error: Column not found</div>); }
  column.cards = column.cards || {}; // null-safe against the column not having cards yet
  const card = column.cards[detail.card];
  if (!card) { return (<div className="card-detail">Error: Card not found</div>); }

  // preemptively convert card.activity to an array if it isn't one already
  card.activity = card.activity || {};
  if (card.activity !== typeof Array) {
    // convert to an array
    const activityKeys = Object.keys(card.activity);
    card.activity = activityKeys.map((a: any, index) => {
      const entry: any = card.activity[a];
      entry.id = a;
      return entry;
    });
  }

  const isReadOnly = props.auth.email !== board.owner;

  return (
    <div className="card-detail">
      <div className="flex flex-row">
        <div className="flex-1">
          <EditableField
            element="h3"
            inputType="input"
            updateInput={(value: any) => handleInputChange("name", value)}
            field={card.name}
            extraClasses="text-2xl underline"
            extraInputClasses="text-2xl card-title-input"
            readOnly={isReadOnly}
          />
        </div>
        {!isReadOnly ? (
          <RemoveButton action={() => props.removeCard(boardId, card.column, card.id, card.name)} />
        ) : null }
      </div>

      <div className="w-full pt-4">
        { showPreview
          ? <div>
              <p className="text-gray-600 text-lg pb-2">
                Description
                {!isReadOnly ? (
                  <span className="px-2 underline text-teal-600" onClick={() => togglePreview(!showPreview)}>
                    Edit
                  </span>
                ) : ( null )}
              </p>
              <ReactMarkdown className="w-full border rounded-sm p-2 border-gray-200" source={card.description}/>
            </div>
          : (
            <div>
              <textarea
                className="w-full h-80 p-2 rounded-lg border border-gray-500"
                name="description"
                value={card.description}
                rows={14}
                onChange={(event) => handleMarkdownChange(event)}
              />
              <button
                className="rounded-sm bg-teal-500 px-4 py-2 border-teal-100 text-white hover:bg-teal-800"
                onClick={() => togglePreview(!showPreview)}
              >
                Close
              </button>
            </div>
          )
        }
      </div>

      <p className="text-gray-600 text-lg pt-4">Activity:</p>
      <hr />
      {
        card.activity && card.activity.map((activity: any, index: any) => {
          return (
            <p className="text-sm text-gray-700 py-2" key={index}>
              {activity.label} <Moment format="YYYY-MM-DD HH:mm">{activity.timestamp}</Moment>
            </p>
          );
        })
      }
    </div>
  );
};

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
  updateCard: (board: any, column: any, card: any, field: any, value: any) =>
    dispatch(updateCard(board, column, card, field, value)),
  removeCard: (boardId: string, columnId: string, cardId: string, name: string) =>
    dispatch(removeCard(boardId, columnId, cardId, name)),
});

const enhance = compose<CardDetailProps, CardDetailProps>(
  firebaseConnect(() => [
    "boards",
  ]),
  connect(
    (state: AppState) => ({
      detail: state.local.detail,
      boards: state.firebase.data.boards,
      auth: state.firebase.auth,
    }),
    mapDispatchToProps,
  ),
  withRouter,
);

export default enhance(CardDetail);
