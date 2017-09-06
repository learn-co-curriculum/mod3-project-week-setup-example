class Api::V1::NotesController < ApplicationController
  before_action :set_note, only: [:show,:update,:destroy]

  def index
    @notes = Note.all
    render json: @notes, status: 200
  end

  def create
    @note = Note.create(note_params)
    render json: @note, status: 201
  end

  def update
    @note.update(note_params)
    render json: @note, status: 200
  end

  def destroy
    noteId = @note.id
    @note.destroy
    render json: {message:"Zap! Note deleted", noteId: noteId}
  end

  def show
    render json: @note, status: 200
  end

  private
  def note_params
    params.permit(:body)
  end

  def set_note
    @note = Note.find(params[:id])
  end
end
